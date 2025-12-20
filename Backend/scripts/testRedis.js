// test-redis.js
import redis from '../config/redis.js'; // Note the .js extension is required in ESM

async function test() {
  console.log("⏳ Connecting to Redis Cloud...");

  try {
    // Write data
    await redis.set('test_key', 'Hello WorkWire!');
    
    // Read data
    const value = await redis.get('test_key');
    
    console.log("-----------------------------------");
    console.log("Retrieved Value:", value); 
    console.log("-----------------------------------");

    if (value === 'Hello WorkWire!') {
        console.log("🎉 SUCCESS: Redis is configured correctly.");
    } else {
        console.log("⚠️ WARNING: Data mismatch.");
    }

  } catch (error) {
    console.error("❌ ERROR during test:", error);
  } finally {
    // Close connection so the script exits
    redis.disconnect();
  }
}

test();