# Free Reverse Image Search APIs - No Credit Card Required 🆓

Perfect for your capstone project! Here are 3 completely FREE options:

## 🥇 Option 1: SerpAPI (Easiest - Recommended)

**Free tier:** 100 searches/month, no credit card needed

### Setup:
1. Sign up at: https://serpapi.com/users/sign_up
2. Get your API key from dashboard
3. Add to `.env`:
   ```
   SERPAPI_KEY=your_key_here
   ```

**Why it's best:** Super easy setup, just sign up and get key!

---

## 🥈 Option 2: Bing Visual Search (Best free tier)

**Free tier:** 3,000 queries/month, no credit card for free tier

### Setup:
1. Go to: https://azure.microsoft.com/free/
2. Sign up for free Azure account (no credit card!)
3. Create "Bing Search v7" resource
4. Get your subscription key
5. Add to `.env`:
   ```
   BING_VISUAL_SEARCH_API_KEY=your_key_here
   ```

**Why it's great:** Highest free quota (3,000/month!)

---

## 🥉 Option 3: Google Custom Search (Free tier)

**Free tier:** 100 queries/day

### Setup:
1. Go to: https://developers.google.com/custom-search/v1/overview
2. Get API key from Google Cloud Console (free)
3. Create Custom Search Engine at: https://programmablesearchengine.google.com/
4. Enable "Image search" in settings
5. Get your Search Engine ID
6. Add to `.env`:
   ```
   GOOGLE_CUSTOM_SEARCH_API_KEY=your_key_here
   GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_engine_id_here
   ```

**Note:** Setup is a bit more complex, but still free!

---

## 🚀 Quick Start

1. **Pick one API** (SerpAPI is easiest)
2. **Get your free API key** (links above)
3. **Add to `.env` file** in backend folder
4. **Test it:**

```bash
# Test with an image URL
node src/utils/reverseImageSearch.js "https://your-image-url.com/image.jpg"
```

Or use in your code:

```javascript
import { reverseImageSearch } from './utils/reverseImageSearch.js';

const result = await reverseImageSearch(imageUrl);
if (result.existsOnline) {
  console.log('⚠️ Image found online - may be duplicate!');
}
```

---

## 💡 Tips

- **For testing:** Use SerpAPI (easiest)
- **For production:** Use Bing (more free queries)
- The code automatically tries all APIs and uses the first one that works
- You can test all APIs at once using `testAllFreeAPIs(imageUrl)`

---

## 📝 Which one should I use?

**For capstone project:** I recommend **SerpAPI** - it's the easiest to set up and 100 free searches/month is plenty for testing!

