package main

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type Client struct {
	conn *websocket.Conn
	peer *Client
	send chan []byte
}

type Hub struct {
	register   chan *Client
	unregister chan *Client
	waiting    *Client
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.waiting == nil {
				h.waiting = client
				client.send <- []byte("Searching for a stranger...")
			} else {
				stranger := h.waiting
				h.waiting = nil

				client.peer = stranger
				stranger.peer = client

				client.send <- []byte("Connected to a random stranger! Say hi!")
				stranger.send <- []byte("Connected to a random stranger! Say hi!")
			}
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if h.waiting == client {
				h.waiting = nil
			}
			if client.peer != nil {
				client.peer.send <- []byte("Stranger has disconnected. Searching for a new match...")
				client.peer.peer = nil
				go func(abandoned *Client) {
					h.register <- abandoned
				}(client.peer)
			}
			close(client.send)
			h.mu.Unlock()
		}
	}
}

// ==========================================
// NEW CODE: THE READ & WRITE PUMPS
// ==========================================

// 1. ReadPump listens for text incoming from the user's browser
func (c *Client) readPump(h *Hub) {
	defer func() {
		h.unregister <- c // If the loop breaks, disconnect the user
		c.conn.Close()
	}()

	for {
		_ , message, err := c.conn.ReadMessage()
		if err != nil {
			break // Connection closed or error occurred
		}

		h.mu.Lock()
		// If they have a partner, route the message directly to the partner's mailbox
		if c.peer != nil {
			c.peer.send <- message
		} else {
			c.send <- []byte("System: You are still alone in the room. Please wait for a stranger.")
		}
		h.mu.Unlock()
	}
}

// 2. WritePump listens to the user's private mailbox and sends it to their browser
func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()

	// This loop waits for data to appear in the c.send channel
	for message := range c.send {
		err := c.conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			return
		}
	}
}

// 3. Handle incoming WebSocket connections
func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return

	}

	// Create the new client instance
	client := &Client{
		conn: conn,
		send: make(chan []byte, 256), // Buffered channel to prevent lag
	}

	// Register them to the Hub lobby
	hub.register <- client

	// Spin up the write pump as a background worker thread
	go client.writePump()

	// Run the read pump on the main thread (blocks until they disconnect)
	client.readPump(hub)
}

func main() {
	hub := NewHub()
	go hub.run()

	// NEW: Serve the static HTML page at the root URL "/"
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	// Keep our WebSocket endpoint mapped
	http.HandleFunc("/text", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	fmt.Println("Stranger Chat Server running on http://localhost:8080...")
	http.ListenAndServe(":8080", nil)
}
