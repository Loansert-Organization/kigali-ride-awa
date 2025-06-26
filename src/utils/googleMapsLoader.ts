
declare global {
  interface Window {
    initGoogleMaps: () => void;
    googleMapsLoaded: boolean;
  }
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  public async loadGoogleMaps(): Promise<void> {
    if (this.isLoaded) {
      console.log('✅ Google Maps already loaded');
      return Promise.resolve();
    }

    if (this.isLoading && this.loadPromise) {
      console.log('🔄 Google Maps loading in progress, waiting...');
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this.loadScript();
    
    try {
      await this.loadPromise;
      this.isLoaded = true;
      window.googleMapsLoaded = true;
      console.log('✅ Google Maps loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load Google Maps:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.maps?.places) {
        resolve();
        return;
      }

      // Create callback function
      window.initGoogleMaps = () => {
        console.log('🎯 Google Maps initialization callback triggered');
        resolve();
      };

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?libraries=places,geometry&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        console.error('❌ Failed to load Google Maps script');
        reject(new Error('Failed to load Google Maps script'));
      };
      
      // Add script to document
      document.head.appendChild(script);
      console.log('📡 Google Maps script added to document');
    });
  }

  public isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!window.google?.maps?.places;
  }
}

export const googleMapsLoader = GoogleMapsLoader.getInstance();
