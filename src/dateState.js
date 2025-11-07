// Date state management for the graph visualization system

// Get the current real-world date (at midnight)
export function getCurrentRealDate() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
}

// Format date as a readable string (e.g., "January 15, 2025")
export function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Add days to a date
export function addDays(date, days) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

// Create a date state manager
export function createDateState() {
    let currentDate = getCurrentRealDate();
    let isPlaying = false;
    let speedMultiplier = 1; // 1x or 2x
    let lastUpdateTime = null;
    let animationFrameId = null;
    let updateCallback = null;

    // Time constants
    const BASE_DAY_DURATION = 1000; // 1 second = 1 day at 1x speed

    function notifyUpdate() {
        if (updateCallback) {
            updateCallback({
                date: currentDate,
                isPlaying,
                speedMultiplier
            });
        }
    }

    function update(timestamp) {
        if (!isPlaying) {
            animationFrameId = null;
            return;
        }

        if (lastUpdateTime !== null) {
            const elapsed = timestamp - lastUpdateTime;
            const dayDuration = BASE_DAY_DURATION / speedMultiplier;
            
            if (elapsed >= dayDuration) {
                currentDate = addDays(currentDate, 1);
                lastUpdateTime = timestamp;
                notifyUpdate();
            }
        } else {
            lastUpdateTime = timestamp;
        }

        animationFrameId = requestAnimationFrame(update);
    }

    return {
        // Get current system date
        getDate() {
            return currentDate;
        },

        // Set the system date
        setDate(date) {
            currentDate = new Date(date);
            currentDate.setHours(0, 0, 0, 0);
            notifyUpdate();
        },

        // Increment date by one day
        nextDay() {
            currentDate = addDays(currentDate, 1);
            notifyUpdate();
        },

        // Decrement date by one day
        previousDay() {
            currentDate = addDays(currentDate, -1);
            notifyUpdate();
        },

        // Reset to current real-world date
        reset() {
            currentDate = getCurrentRealDate();
            notifyUpdate();
        },

        // Play/pause controls
        play() {
            if (!isPlaying) {
                isPlaying = true;
                lastUpdateTime = null;
                animationFrameId = requestAnimationFrame(update);
                notifyUpdate();
            }
        },

        pause() {
            if (isPlaying) {
                isPlaying = false;
                lastUpdateTime = null;
                if (animationFrameId !== null) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                notifyUpdate();
            }
        },

        togglePlayPause() {
            if (isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        },

        // Check if currently playing
        isPlaying() {
            return isPlaying;
        },

        // Speed multiplier controls
        getSpeedMultiplier() {
            return speedMultiplier;
        },

        setSpeedMultiplier(multiplier) {
            speedMultiplier = multiplier;
            notifyUpdate();
        },

        toggleSpeed() {
            speedMultiplier = speedMultiplier === 1 ? 2 : 1;
            notifyUpdate();
        },

        // Set callback for state updates
        onUpdate(callback) {
            updateCallback = callback;
        },

        // Cleanup
        dispose() {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
            updateCallback = null;
        }
    };
}
