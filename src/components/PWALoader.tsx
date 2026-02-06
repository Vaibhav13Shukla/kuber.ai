'use client';

import { useEffect } from 'react';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

export function PWALoader() {
  useEffect(() => {
    // Load PWA Elements for Capacitor camera in browser
    defineCustomElements(window);
  }, []);

  return null;
}
