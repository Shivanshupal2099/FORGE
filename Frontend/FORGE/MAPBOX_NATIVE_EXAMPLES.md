# Mapbox style usage for web, Android, iOS, and Flutter

## Web (Mapbox GL JS)
```js
const map = new mapboxgl.Map({
  accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',
  container: 'map',
  style: 'mapbox://styles/shivanshu2005/cmr1nkjcf000101sdbnaxcjhy',
  center: [0, 0],
  zoom: 3
})
```

## Android
```kotlin
val mapView = MapView(
    context = context,
    mapInitOptions = MapInitOptions(
        context = context,
        styleUri = "mapbox://styles/shivanshu2005/cmr1nkjcf000101sdbnaxcjhy"
    )
)
```

## iOS
```swift
let mapView = MapView(frame: view.bounds, mapInitOptions: MapInitOptions(styleURI: StyleURI(rawValue: "mapbox://styles/shivanshu2005/cmr1nkjcf000101sdbnaxcjhy")!))
```

## Flutter
```dart
await mapboxMap.loadStyleURI("mapbox://styles/shivanshu2005/cmr1nkjcf000101sdbnaxcjhy");
```
