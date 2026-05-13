# ngxtension/inject-bluetooth

Reactive [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API). Provides the ability to connect and interact with Bluetooth Low Energy peripherals.

The Web Bluetooth API lets websites discover and communicate with devices over the Bluetooth 4 wireless standard using the Generic Attribute Profile (GATT).

## Import

```typescript
import { injectBluetooth } from 'ngxtension/inject-bluetooth';
```

## Usage

### Basic Example

```typescript
import { Component, effect } from '@angular/core';
import { injectBluetooth } from 'ngxtension/inject-bluetooth';

@Component({
  selector: 'app-bluetooth',
  standalone: true,
  template: `
    <button (click)="requestDevice()">Request Bluetooth Device</button>
    <div *ngIf="bluetooth.error()">Error: {{ bluetooth.error() }}</div>
    <div *ngIf="bluetooth.isConnected()">
      Connected to: {{ bluetooth.device()?.name }}
    </div>
  `,
})
export class BluetoothComponent {
  bluetooth = injectBluetooth({
    acceptAllDevices: true,
  });

  constructor() {
    effect(() => {
      console.log('Supported:', this.bluetooth.supported());
      console.log('Connected:', this.bluetooth.isConnected());
      console.log('Device:', this.bluetooth.device());
    });
  }

  requestDevice() {
    this.bluetooth.requestDevice();
  }
}
```

### Battery Level Example

This example illustrates how to read battery level and be notified of changes from a nearby Bluetooth Device advertising Battery information with Bluetooth Low Energy.

```typescript
import { Component, effect, signal } from '@angular/core';
import { injectBluetooth } from 'ngxtension/inject-bluetooth';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-battery-monitor',
  standalone: true,
  template: `
    <button (click)="requestDevice()">Connect to Device</button>
    <div *ngIf="batteryPercent() !== undefined">
      Battery Level: {{ batteryPercent() }}%
    </div>
  `,
})
export class BatteryMonitorComponent {
  bluetooth = injectBluetooth({
    acceptAllDevices: true,
    optionalServices: ['battery_service'],
  });

  batteryPercent = signal<number | undefined>(undefined);
  private isGettingBatteryLevels = false;

  constructor() {
    effect(() => {
      const server = this.bluetooth.server();
      const isConnected = this.bluetooth.isConnected();

      if (isConnected && server && !this.isGettingBatteryLevels) {
        this.getBatteryLevels(server);
      }
    });
  }

  async getBatteryLevels(server: BluetoothRemoteGATTServer) {
    this.isGettingBatteryLevels = true;

    try {
      // Get the battery service
      const batteryService = await server.getPrimaryService('battery_service');

      // Get the current battery level
      const batteryLevelCharacteristic =
        await batteryService.getCharacteristic('battery_level');

      // Listen to characteristic value changes
      fromEvent(batteryLevelCharacteristic, 'characteristicvaluechanged')
        .pipe(takeUntilDestroyed())
        .subscribe((event: any) => {
          this.batteryPercent.set(event.target.value.getUint8(0));
        });

      // Read the initial value
      const batteryLevel = await batteryLevelCharacteristic.readValue();
      this.batteryPercent.set(batteryLevel.getUint8(0));
    } catch (error) {
      console.error('Error getting battery levels:', error);
    }
  }

  requestDevice() {
    this.bluetooth.requestDevice();
  }
}
```

## API

### Options

```typescript
interface InjectBluetoothOptions {
  /**
   * A boolean value indicating that the requesting script can accept all Bluetooth
   * devices. The default is false.
   *
   * !! This may result in a bunch of unrelated devices being shown
   * in the chooser and energy being wasted as there are no filters.
   *
   * Use it with caution.
   *
   * @default false
   */
  acceptAllDevices?: boolean;

  /**
   * An array of BluetoothScanFilters. This filter consists of an array
   * of BluetoothServiceUUIDs, a name parameter, and a namePrefix parameter.
   */
  filters?: BluetoothLEScanFilter[] | undefined;

  /**
   * An array of BluetoothServiceUUIDs.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTService/uuid
   */
  optionalServices?: BluetoothServiceUUID[] | undefined;

  /**
   * A custom Window instance. This is useful when working with iframes or in testing environments.
   */
  window?: Window;

  /**
   * A custom Injector instance for dependency injection.
   */
  injector?: Injector;
}
```

### Return Value

```typescript
interface InjectBluetoothReturn {
  /**
   * Whether the Web Bluetooth API is supported
   */
  supported: Signal<boolean>;

  /**
   * Whether a device is currently connected
   */
  isConnected: Signal<boolean>;

  /**
   * The connected Bluetooth device
   */
  device: Signal<BluetoothDevice | undefined>;

  /**
   * Function to request a Bluetooth device
   */
  requestDevice: () => Promise<void>;

  /**
   * The GATT server for the connected device
   */
  server: Signal<BluetoothRemoteGATTServer | undefined>;

  /**
   * Any error that occurred during connection
   */
  error: Signal<unknown | null>;
}
```

## Browser Compatibility

The Web Bluetooth API is currently partially implemented in Android M, Chrome OS, Mac, and Windows 10. For a full overview of browser compatibility please see [Web Bluetooth API Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API#browser_compatibility)

## Important Notes

- There are a number of caveats to be aware of with the web bluetooth API specification. Please refer to the [Web Bluetooth W3C Draft Report](https://webbluetoothcg.github.io/web-bluetooth/) for numerous caveats around device detection and connection.
- This API is not available in Web Workers (not exposed via WorkerNavigator).
- The `requestDevice()` function must be called in response to a user gesture (like a button click).

## More Examples

More samples can be found on [Google Chrome's Web Bluetooth Samples](https://googlechrome.github.io/samples/web-bluetooth/).
