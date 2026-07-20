/**
 * RAF Coordinator
 * 
 * Consolidates multiple requestAnimationFrame loops into a single coordinated loop
 * to reduce CPU overhead, improve battery life, and prevent concurrent RAF thrashing.
 * 
 * Usage:
 *   const unregister = rafCoordinator.register((time) => {
 *     // your animation logic
 *   });
 *   
 *   // Later, to stop:
 *   unregister();
 */

class RAFCoordinator {
  private callbacks = new Set<(time: number) => void>();
  private rafId: number | null = null;
  private lastTime = 0;

  /**
   * Register a callback to be called on every animation frame.
   * Returns an unregister function to remove the callback.
   */
  register(callback: (time: number) => void): () => void {
    this.callbacks.add(callback);
    
    // Start the loop if this is the first callback
    if (!this.rafId) {
      this.start();
    }
    
    return () => this.unregister(callback);
  }

  /**
   * Unregister a callback. Automatically stops the loop if no callbacks remain.
   */
  private unregister(callback: (time: number) => void): void {
    this.callbacks.delete(callback);
    
    // Stop the loop if no callbacks remain
    if (this.callbacks.size === 0 && this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Start the RAF loop
   */
  private start(): void {
    const tick = (time: number) => {
      this.lastTime = time;
      
      // Execute all registered callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(time);
        } catch (error) {
          console.error('RAF callback error:', error);
        }
      });
      
      // Continue the loop
      this.rafId = requestAnimationFrame(tick);
    };
    
    this.rafId = requestAnimationFrame(tick);
  }

  /**
   * Get the number of active callbacks
   */
  getActiveCount(): number {
    return this.callbacks.size;
  }

  /**
   * Force stop the RAF loop (useful for cleanup)
   */
  forceStop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.callbacks.clear();
  }
}

// Export singleton instance
export const rafCoordinator = new RAFCoordinator();
