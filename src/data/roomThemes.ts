export interface RoomBackgroundScene {
  id: string;
  name: string;
  category: 'Popular' | 'Lofi' | 'Pixel Art' | 'Aesthetic' | 'Cozy' | 'Nature' | 'Cities' | 'Space' | '#StudyWithMe' | 'Fantasy';
  thumbnail: string;
  imageUrl: string;
  videoUrl?: string;
  ambientSound: string;
  isPopular?: boolean;
}

export const SCENIC_ROOM_BACKGROUNDS: RoomBackgroundScene[] = [
  {
    id: 'japanese_hills',
    name: 'Japanese Hills at Dusk 🍃',
    category: 'Aesthetic',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'lofi',
    isPopular: true,
  },
  {
    id: 'tokyo_cafe',
    name: 'Tokyo Cafe ⭐',
    category: 'Popular',
    thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'cafe',
    isPopular: true,
  },
  {
    id: 'croatian_waterfall',
    name: 'Croatian Waterfall',
    category: 'Nature',
    thumbnail: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'rain',
    isPopular: true,
  },
  {
    id: 'beach_sunset',
    name: 'Calm Beach Sunset',
    category: 'Popular',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'lofi',
    isPopular: true,
  },
  {
    id: 'countryside_village',
    name: 'Countryside Village House',
    category: 'Cozy',
    thumbnail: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'forest',
    isPopular: true,
  },
  {
    id: 'earth_from_space',
    name: 'Earth from Space',
    category: 'Space',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'binaural',
    isPopular: true,
  },
  {
    id: 'starscapes',
    name: 'Stunning Starscapes',
    category: 'Space',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'binaural',
    isPopular: true,
  },
  {
    id: 'magical_bookstore',
    name: 'Magical Bookstore in the Woods',
    category: 'Cozy',
    thumbnail: 'https://images.unsplash.com/photo-1507842229451-7f01be8510ab?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be8510ab?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'library',
    isPopular: true,
  },
  {
    id: 'hogwarts_express',
    name: 'Hogwarts Express Train',
    category: 'Fantasy',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'rain',
    isPopular: true,
  },
  {
    id: 'rain_over_tokyo',
    name: 'Rain Over Tokyo',
    category: 'Cities',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'rain',
    isPopular: true,
  },
  {
    id: 'lofi_pixel_bedroom',
    name: 'Pixel Art Midnight Study',
    category: 'Pixel Art',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'lofi',
  },
  {
    id: 'study_with_nature',
    name: 'Study with Nature 🐺❄️',
    category: '#StudyWithMe',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&auto=format&fit=crop&q=85',
    ambientSound: 'forest',
  }
];

export const AUDIO_TRACKS = [
  { id: 'neo_soul', title: 'Neo Soul Lofi 🌿 Smooth...', type: 'lofi' },
  { id: 'rain_window', title: 'Midnight Rainfall 🌧️ Chill', type: 'rain' },
  { id: 'coffee_jazz', title: 'Kyoto Coffee Shop ☕ Jazz', type: 'cafe' },
  { id: 'library_ambient', title: 'Oxford Old Library 📚 Silence', type: 'library' },
  { id: 'forest_breeze', title: 'Alpine Pine Forest 🌲 Birds', type: 'forest' },
  { id: 'alpha_flow', title: 'Alpha Focus Wave 🧠 432Hz', type: 'binaural' },
];
