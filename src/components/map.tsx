'use client';

import { APIProvider, Map as GoogleMap, Marker } from '@vis.gl/react-google-maps';
import { Card } from './ui/card';

export function Map({ lat, lng }: { lat: number; lng: number }) {
  const position = { lat, lng };
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Card className="h-[400px] w-full flex items-center justify-center bg-muted/50 border-dashed">
        <div className="text-center text-muted-foreground p-4">
          <p className="font-semibold">Google Maps could not be loaded.</p>
          <p className="text-xs mt-1">
            The server is missing the `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` environment variable.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="h-[400px] w-full rounded-lg overflow-hidden border">
        <GoogleMap
          defaultCenter={position}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId="huku-market-map"
          style={{width: '100%', height: '100%'}}
        >
          <Marker position={position} />
        </GoogleMap>
      </div>
    </APIProvider>
  );
}
