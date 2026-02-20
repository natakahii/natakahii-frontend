# Setup Instructions for Natakahii Frontend

## Issue Fixed
The page was showing the old login/register pages because the routing was set to show Login as the default page. I've updated [`App.jsx`](src/App.jsx) to show the new Home page at the root path (`/`).

## Changes Made

### 1. Updated App.jsx
- Changed default route from Login to Home page
- Added Browse page route
- Removed the logo from the main app container (it's now in the Home page header)

### 2. Updated App.css
- Changed `.app-container` to not center content (for full-page layouts)
- Added `.auth-container` class for auth pages that need centered layout
- Updated background color to match new design (#F8F9FC)

## How to Run

```bash
cd Natakahii-frontend
npm install
npm run dev
```

The app should now open at `http://localhost:5173` and show the new Home page with:
- Hero carousel
- Categories section
- Featured products
- Top vendors
- New arrivals

## Available Routes

- `/` - Home page (new marketplace UI)
- `/browse` - Browse products with search and filters
- `/login` - Login page (existing)
- `/register` - Register page (existing)
- `/verify-registration` - Email verification (existing)
- `/forgot-password` - Password reset request (existing)
- `/reset-password` - Password reset (existing)

## Navigation

The Home page has:
- **Search icon** in header → Links to `/browse`
- **Login button** in header → Links to `/login`
- **"See All" buttons** → Link to `/browse`
- **Category cards** → Will link to `/category/:id` (to be implemented)
- **Product cards** → Will link to `/product/:id` (to be implemented)
- **Vendor cards** → Will link to `/vendor/:id` (to be implemented)

## Testing the New Pages

1. **Home Page** - Should load automatically at `/`
   - Test hero carousel auto-rotation
   - Test horizontal scrolling on mobile
   - Test responsive grid on desktop

2. **Browse Page** - Click search icon or "See All" buttons
   - Test search functionality
   - Test category filters
   - Test sort options
   - Test responsive grid (2-col mobile → 6-col ultra-wide)

## Responsive Testing

Test at these breakpoints:
- **Mobile**: 375px, 414px
- **Tablet**: 768px, 1024px
- **Desktop**: 1280px, 1440px
- **Ultra-wide**: 1920px+

## Next Steps

To complete the implementation, you'll need to:

1. **Update Auth Pages** - Wrap auth page content in `.auth-container` div instead of `.app-container`
2. **Add Remaining Pages**:
   - Cart page
   - Profile page
   - Product detail page
   - Vendor store page
   - Category page

3. **Add Navigation Components**:
   - Bottom navigation for mobile
   - Footer component

4. **Add State Management**:
   - Cart context
   - Auth context

## Troubleshooting

### If the page still shows login:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors
4. Verify you're at `http://localhost:5173/` (not `/login`)

### If styles don't load:
1. Check that CSS files are in the correct location
2. Verify imports in JSX files
3. Check browser console for 404 errors

### If icons don't show:
- Icons are currently using emoji placeholders
- Replace with a proper icon library like `react-icons`:
  ```bash
  npm install react-icons
  ```
  Then update icon usage in components

## Brand Colors Reference

- **Primary Blue**: #142490
- **Accent Orange**: #F05A28
- **Background**: #F8F9FC
- **Text**: #1A1A2E

These colors are used consistently throughout all pages.
