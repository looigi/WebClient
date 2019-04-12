import {Component, Input} from '@angular/core';

@Component({
    selector: 'map-result-view',
    template: `
                <sebm-google-map [latitude]="latitude" [longitude]="longitude">
                  <sebm-google-map-marker [latitude]="latitude" [longitude]="longitude"></sebm-google-map-marker>
                </sebm-google-map>
        `,
    styles: [`
    .sebm-google-map-container {
      height: 300px;
    }`]
})
export class MapsResultComponent {

    @Input() latitude;
    @Input() longitude;
}
