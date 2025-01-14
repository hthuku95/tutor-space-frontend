class WebSocketManager {
    constructor(url, options = {}) {
      this.url = url;
      this.options = options;
      this.ws = null;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
      this.reconnectInterval = options.reconnectInterval || 3000;
      this.onMessageCallback = null;
      this.onErrorCallback = null;
      this.onCloseCallback = null;
      this.onOpenCallback = null;
    }
  
    connect() {
      try {
        this.ws = new WebSocket(this.url);
  
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        };
  
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (this.onErrorCallback) {
            this.onErrorCallback(error);
          }
        };
  
        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          if (this.onCloseCallback) {
            this.onCloseCallback();
          }
          this._handleReconnect();
        };
  
        this.ws.onopen = () => {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
          if (this.onOpenCallback) {
            this.onOpenCallback();
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        this._handleReconnect();
      }
    }
  
    onMessage(callback) {
      this.onMessageCallback = callback;
    }
  
    onError(callback) {
      this.onErrorCallback = callback;
    }
  
    onClose(callback) {
      this.onCloseCallback = callback;
    }
  
    onOpen(callback) {
      this.onOpenCallback = callback;
    }
  
    disconnect() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }
  
    _handleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.reconnectInterval);
      } else {
        console.error('Max reconnection attempts reached');
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error('Max reconnection attempts reached'));
        }
      }
    }
  }
  
  export const createAssignmentWebSocket = (assignmentId, baseUrl) => {
    const wsUrl = `${baseUrl.replace('http', 'ws')}/ws/assignments/${assignmentId}/generation/`;
    return new WebSocketManager(wsUrl, {
      maxReconnectAttempts: 5,
      reconnectInterval: 3000
    });
  };
  
  export const createProjectWebSocket = (projectId, baseUrl) => {
    const wsUrl = `${baseUrl.replace('http', 'ws')}/ws/projects/${projectId}/progress/`;
    return new WebSocketManager(wsUrl, {
      maxReconnectAttempts: 5,
      reconnectInterval: 3000
    });
  };