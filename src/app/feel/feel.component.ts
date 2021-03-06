import { Component, OnInit, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';

@Component({
  selector: 'app-feel',
  templateUrl: './feel.component.html',
  styleUrls: ['./feel.component.scss']
})
export class FeelComponent implements OnInit {
  static GATT_CHARACTERISTIC_BATTERY_LEVEL = 'battery_level';
  static GATT_PRIMARY_SERVICE = 'battery_service';

  public valor;

  constructor(private ble:BluetoothCore) { }

  ngOnInit() {
  }

  //https://github.com/manekinekko/angular-web-bluetooth/blob/master/dist/lib/bluetooth.service.d.ts
  discover() {
    this.ble.discover({
      filters: this.anyDeviceFilter(),
      acceptAllDevices: true
    });
  }

  anyDeviceFilter() {
    // This is the closest we can get for now to get all devices.
    // https://github.com/WebBluetoothCG/web-bluetooth/issues/234
    // acceptAllDevices puto. no funcionaaa
    const arr = [];
       Array.from('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
        .forEach(c => arr.push({namePrefix: c}));

    return arr;
  }

  getFakeValue() {
    this.ble.fakeNext();
  }

  getDevice() {

    // call this method to get the connected device
    return this.ble.getDevice$();
  }

  streamValues() {

    // call this method to get a stream of values emitted by the device
    return this.ble.streamValues$()
      .map(value => value.getUint8(0));
  }

  getBattery(){
    this.getBatteryLevel().subscribe(valor => this.valor = valor);
  }


  /**
   * Get Battery Level GATT Characteristic value.
   * This logic is specific to this service, this is why we can't abstract it elsewhere.
   * The developer is free to provide any service, and characteristics she wants.
   *
   * @return {Observable<number>} Emites the value of the requested service read from the device
   */
   getBatteryLevel(): Observable<number> {
    alert('Tomando el nivel de batería...');

    try {
        return this.ble
          // 1) call the discover method will trigger the discovery process (by the browser)
          .discover$({ filters: this.anyDeviceFilter(), optionalServices: [FeelComponent.GATT_PRIMARY_SERVICE] })
          // 2) get that service
          .mergeMap(gatt => this.ble.getPrimaryService$(gatt, FeelComponent.GATT_PRIMARY_SERVICE))
          // 3) get a specific characteristic on that service
          .mergeMap(primaryService => this.ble.getCharacteristic$(primaryService, FeelComponent.GATT_CHARACTERISTIC_BATTERY_LEVEL))
          // 4) ask for the value of that characteristic (will return a DataView)
          .mergeMap(characteristic => this.ble.readValue$(characteristic))
            // 5) on that DataView, get the right value
          .map(value => {
            alert(value)
            return value.getUint8(0);
          });
    }
    catch(e) {
      alert('Oops! no se pudo leer el valor de %s');
    }

  }

}
