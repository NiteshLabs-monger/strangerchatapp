package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	clients = make(map[*Client]bool)
	mutex   = sync.Mutex{}
)

type Client struct {
	conn *websocket.Conn
	peer *Client
	send chan []byte
}

type Hub struct {
	register   chan *Client
	unregister chan *Client
	skip       chan *Client
	waiting    *Client
	mu         sync.Mutex
}

func broadcastOnlineCount() {
	mutex.Lock()
	count := len(clients)

	msgData, err := json.Marshal(map[string]any{
		"type":  "online_count",
		"count": count,
	})
	if err != nil {
		mutex.Unlock()
		return
	}

	for client := range clients {
		select {
		case client.send <- msgData:
		default:
			// If channel buffer is full, connection is slow or unresponsive
		}
	}
	mutex.Unlock()
}

func NewHub() *Hub {
	return &Hub{
		register:   make(chan *Client),
		unregister: make(chan *Client),
		skip:       make(chan *Client),
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

		case client := <-h.skip: // NEW: Handle skip logic
			h.mu.Lock()
			// Only skip if the client is currently matched with someone
			if client.peer != nil {
				peer := client.peer

				// 1. Break the pair connection
				client.peer = nil
				peer.peer = nil

				// 2. Notify both users
				client.send <- []byte("You skipped the chat. Searching for a new match...")
				peer.send <- []byte("Stranger has left. Searching for a new match...")

				go func(c1, c2 *Client) {
					h.register <- c1
					h.register <- c2
				}(client, peer)
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

// 1. ReadPump listens for text incoming from the user's browser
func (c *Client) readPump(h *Hub) {
	defer func() {
		h.unregister <- c // If the loop breaks, disconnect the user
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			break // Connection closed or error occurred
		}

		if string(message) == "/skip" {
			h.skip <- c
			continue
		}

		h.mu.Lock()

		if c.peer != nil {
			c.peer.send <- message
		} else {
			c.send <- []byte("System: You are still alone in the room. Please wait for a stranger.")
		}
		h.mu.Unlock()
	}
}

func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()

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
	client := &Client{
		conn: conn,
		send: make(chan []byte, 256), // Buffered channel to prevent lag
	}

	mutex.Lock()
	clients[client] = true
	mutex.Unlock()

	// Notify all clients about updated online count
	broadcastOnlineCount()

	// Keep connection alive & handle disconnect
	defer func() {
		mutex.Lock()
		delete(clients, client)
		mutex.Unlock()
		conn.Close()
		broadcastOnlineCount()
	}()

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

	// Keep our WebSocket endpoint mapped
	http.HandleFunc("/text", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	fmt.Println("Stranger Chat Server running on http://localhost:8080...")
	http.ListenAndServe(":8080", nil)
}
