// moderationConverterExtended.js

// Plugin metadata
export const name = "Moderation Command Converter Extended";
export const version = "1.2.0";
export const description =
  "Converts moderation commands into automatic mute and warn commands. '/1 user' becomes '?mute user 1d trading' and '?warn user trading', '/2 user' becomes '?mute user 5h spaming' and '?warn user spaming', and '/3 user' becomes '?mute user 1d hard r' and '?warn user hard r'.";

// Reference to unpatch our modifications
let unpatchSendMessage = null;

export function onLoad() {
  // Replace this with the actual reference to the chat module in BunnyCord.
  const ChatModule = window.ChatModule;
  if (!ChatModule || typeof ChatModule.sendMessage !== "function") {
    console.error("ChatModule not found – aborting plugin load.");
    return;
  }

  // Patch the sendMessage function to intercept our moderation commands
  unpatchSendMessage = patchFunction(ChatModule, "sendMessage", function(original, message, ...rest) {
    if (typeof message.content === "string") {
      const trimmed = message.content.trim();
      const parts = trimmed.split(" ");
      // Check for the '/1' command (trading)
      if (trimmed.startsWith("/1 ") && parts.length >= 2) {
        const targetUser = parts[1];
        const reason = "trading";
        ChatModule.sendMessage(`?mute ${targetUser} 1d ${reason}`);
        ChatModule.sendMessage(`?warn ${targetUser} ${reason}`);
        return;
      }
      // Check for the '/2' command (spaming)
      if (trimmed.startsWith("/2 ") && parts.length >= 2) {
        const targetUser = parts[1];
        const reason = "spaming";
        ChatModule.sendMessage(`?mute ${targetUser} 5h ${reason}`);
        ChatModule.sendMessage(`?warn ${targetUser} ${reason}`);
        return;
      }
      // Check for the '/3' command (hard r)
      if (trimmed.startsWith("/3 ") && parts.length >= 2) {
        const targetUser = parts[1];
        const reason = "hard r";
        ChatModule.sendMessage(`?mute ${targetUser} 1d ${reason}`);
        ChatModule.sendMessage(`?warn ${targetUser} ${reason}`);
        return;
      }
    }
    // Otherwise, call the original sendMessage function
    return original(message, ...rest);
  });
}

export function onUnload() {
  if (unpatchSendMessage) {
    unpatchSendMessage();
    unpatchSendMessage = null;
  }
}

/**
 * A helper function to patch a module's function.
 * Returns a function that restores the original function.
 *
 * @param {Object} module - The module containing the function to patch.
 * @param {string} functionName - The name of the function to patch.
 * @param {Function} patch - A function that wraps the original function.
 */
function patchFunction(module, functionName, patch) {
  const original = module[functionName];
  module[functionName] = function(...args) {
    return patch(original.bind(module), ...args);
  };
  return function() {
    module[functionName] = original;
  };
}
