import {
  Component,
  Input, Output, OnChanges, SimpleChange,
  ViewChild, EventEmitter
} from '@angular/core';

import { LatLngBounds, MapsAPILoader, SebmGoogleMap } from 'angular2-google-maps/core';
import { NeidControllerComponent } from './neid-controller.component';

@Component({
  selector: 'map-technology',
  styleUrls: ['map-technology.css'],
  templateUrl: 'map-technology.html'
})

export class MapTechnologyComponent implements OnChanges {
  static t: MapTechnologyComponent;

  @Input() sitesList;
  @Input() icoPath;
  @Input() maskName;
  @Input() icoCust;
  @Output() changeSelection: EventEmitter<any> = new EventEmitter<any>();
  @Output() boundVisibleChange: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('map') map: SebmGoogleMap;

  public urlIcons = 'assets/img/icons/';
  private custIco = {'Critical': 'Critical.png', 'Ok': 'Ok.png', 'Unk': 'Unk.png'};
  private latitude = 41.822735;
  private longitude = 12.408649;
  latlngBounds;
  private lastInfoSite = null;
  private toClose = false;
  public markers2;
  private selectedM;

  styles = [
    {
      'stylers': [
        {
          'saturation': -80
        }
      ]
    }
  ];

  constructor(private mapsAPILoader: MapsAPILoader) {
    this.toClose = false;
  };

  ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    MapTechnologyComponent.t = this;

    if (changes['icoCust']) {
      if (this.icoPath !== '' && this.icoCust) {
        this.urlIcons = this.icoPath;
        this.custIco = this.icoCust;
      }
    }
    if (changes['sitesList']) {
      if (this.sitesList) {
        this.getCenter();
      }
    }
  }

  // Map centering and marker fitting
  private getCenter() {
    // Get center and fit markers in map
    this.mapsAPILoader.load().then(() => {
      this.latlngBounds = new window['google'].maps.LatLngBounds();
      if (this.sitesList) {
        this.sitesList.forEach(location => {
          if (location['GEO_COORDINATE']) {
            const lat = Number(location['GEO_COORDINATE'].split(';')[0]);
            const lng = Number(location['GEO_COORDINATE'].split(';')[1]);
            const point = new window['google'].maps.LatLng(lat, lng);
            this.latlngBounds.extend(point);
          }
        });
      } else {
        this.latlngBounds.extend(new window['google'].maps.LatLng(this.latitude, this.longitude));
      }
     });

     this.drawAOT();
  }

  // Get Marker Site Latitude
  private getSiteLat(site): number {
    if (site['GEO_COORDINATE']) {
      return Number(site['GEO_COORDINATE'].split(';')[0]);
    } else {
      return 0;
    }
  }

  // Get Marker Site Loongitude
  private getSiteLng(site): number {
    if (site['GEO_COORDINATE']) {
      return Number(site['GEO_COORDINATE'].split(';')[1]);
    } else {
      return 0;
    }
  }

  cutValue(s) {
    if (s.indexOf('&') > -1) {
      return s.substring(0, s.indexOf('&'));
    } else {
      return s;
    }
  }

  // Get icon status for markers
  private getIconStatus(status) {
    switch (status) {
      case 'NotWorking':
        return this.custIco['Critical'];
      case 'Working':
        return this.custIco['Ok'];
      default:
        return this.custIco['Unk'];
    }
  }

  // Switch InfoWindows
  private siteClicked(site) {
    // switch infoSite
    // this.toClose = true;
    // if (this.lastInfoSite && this.lastInfoSite !== infoSite) {
    //   this.toClose = false;
    //   this.lastInfoSite.close();
    // }
    this.changeSelection.emit(site['SITE_ID']);
    // if (infoSite) {
    //   infoSite.open();
    // }

    const m = {
      latitude: this.getSiteLat(site),
      longitude: this.getSiteLng(site),
      icon: 'assets/img/maps/hexagon-outline.png',
      title: 'Selected'
    };
    this.selectedM = m;

    this.drawAOT();

    // this.lastInfoSite = infoSite;
  }

  drawAOT() {
    const s = this.maskName;
    if (s === 'neid') {
      const t = NeidControllerComponent.t;
      const roles = t.getTupleList();
      let o = false;

      let mark = '[';

      if (this.selectedM) {
        mark += JSON.stringify(this.selectedM) + ', ';
        o = true;
      }

      roles.forEach(role => {
        const roleSite = role.roleSite;
        const siteId = role.siteId;

        this.sitesList.forEach(site => {
          if (siteId === site.SITE_ID) {
            const m = {
              title: roleSite,
              latitude: this.getSiteLat(site),
              longitude: this.getSiteLng(site),
              icon: 'assets/img/maps/letter-' + roleSite.toLowerCase() + '.png'
            };
            mark += JSON.stringify(m) + ', ';
            o = true;
          }
        });
      });

      if (o) {
        mark = mark.substring(0, mark.length - 2);
      }

      mark += ']';

      try {
        this.markers2 = JSON.parse(mark);
      } catch (e) {

      }
    }
  }

  // Close InfoWindow Site
  private infoSiteClose() {
    this.toClose === true ? this.changeSelection.emit(null) : this.toClose = true;
  }

  // Resize Map before render (prevent marker leak after modal closing and reopening)
  public refreshMap() {
    this.map.triggerResize().then(() => { this.getCenter(); });
  }

  boundsChanged(event: LatLngBounds) {
    const boundMarkers = [];
    this.sitesList.forEach(location => {
      if (location['GEO_COORDINATE']) {
        const lat = Number(location['GEO_COORDINATE'].split(';')[0]);
        const lng = Number(location['GEO_COORDINATE'].split(';')[1]);
        const point = new window['google'].maps.LatLng(lat, lng);
        // console.log('Marker Position', point);
        if (event.contains(point) === true) {
        //  console.log('Rientra');
          boundMarkers.push(location.SITE_ID);
        }
      }
    });
      this.boundVisibleChange.emit(boundMarkers);
  }
}

