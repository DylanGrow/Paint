# Tomás Estrada Website - Auto-Pilot Handoff

✅ **Live Site**: [Your Netlify URL here]

---

## 📸 How Tomás Adds Photos (15 Seconds, Zero Tech)

1. Open the website on his phone: `https://your-site.netlify.app`
2. Scroll to **"📸 Add Project Photo"**
3. Tap the green **Upload Photo** button
4. Choose a photo from his phone (or take a new one)
5. (Optional) Add a short caption like "Kitchen repaint - Durham"
6. Tap **Upload** → Wait for the ✓ checkmark
7. **Done!** Photo auto-appears in the gallery within seconds

🔹 No login, no dashboard, no code — just tap and go.

---

## 🛠️ For You (Developer Notes)

### Cloudinary Setup (One-Time)
- Cloud Name: `dluij5pkt`
- Upload Preset: `tomas-gallery` (must be **Unsigned** mode)
- Gallery fetches from tag: `tomas-gallery`

### To Update Text/Phone/Services
1. Edit `index.html` in your code editor
2. Find & replace text (look for `data-i18n="..."` for bilingual content)
3. Save → ZIP the folder → drag to Netlify

### To Redeploy
1. ZIP the entire `tomas-website/` folder
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the ZIP file → live instantly

### Troubleshooting
- Photos not appearing? Wait 1-2 minutes for Cloudinary propagation.
- Upload fails? Check phone has internet + photo is under 8MB.
- Gallery empty? Default placeholder images show until first upload.

---

## 🔐 Privacy & Safety
- All uploaded images are public (portfolio use)
- No personal data collected beyond optional captions
- Cloudinary free tier: ~25GB storage/bandwidth/month
- GDPR-friendly: no tracking scripts added

Last updated: May 2026
