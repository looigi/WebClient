import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChange, ViewChildren,
  QueryList, AfterViewInit, AfterViewChecked
} from '@angular/core';
import {MapsAPILoader, SebmGoogleMapMarker} from 'angular2-google-maps/core';

@Component({
  selector: 'report-map-results',
  styleUrls: ['report-map-results.css'],
  templateUrl: 'report-map-results.html'
})

export class ReportMapResultsComponent implements OnChanges, AfterViewInit, AfterViewChecked {
  static t: ReportMapResultsComponent;

  @Input() markers: any[];
  @Input() markerCategory: string;
  @Input() selection = null;
  @Output() markerSelected: EventEmitter<any> = new EventEmitter<any>();

  @ViewChildren(SebmGoogleMapMarker) listMarkers: QueryList<SebmGoogleMapMarker>;

  private measure = null;
  public dimension = null;
  requestInProgress: boolean;
  // public zoom = 5;
  public latitude = 41.822735;
  public longitude = 12.408649;
  public latlngBounds;
  private lastInfoMarker = null;
  private selectionIsChanged: boolean;
  private markersReady: boolean;
  public markers2;

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
    this.requestInProgress = true;
    this.selectionIsChanged = false;
    this.markersReady = false;
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange}) {
    if (changes['markers']) {
      console.log ('caricamento mappa...');
      this.requestInProgress = true;
      this.measure = this.markers['ColumnProperty'].filter(msr => ('' + msr.displayAs).includes('Measure.Value')).map(key => key.key);
      this.dimension = this.markers['ColumnProperty'].filter(dim => ('' + dim.displayAs).includes('Dimension.Geo')).map(key => key.key);
      this.getCenter('');
      this.requestInProgress = false;
    }
    if (changes['selection']) {
      // La QueryList infoMarker è disponibile non prima di AfterViewInit
      // segnalo ad AfterViewChecked che la selezione è cambiata.
      this.selectionIsChanged = true;
    }
  }

  cutValue(s) {
    if (s.indexOf('&') > -1) {
      return s.substring(0, s.indexOf('&'));
    } else {
      return s;
    }
  }

  // QueryList infoMarker pronta
  ngAfterViewInit() {
    this.markersReady = true;
    ReportMapResultsComponent.t = this;
  }

  ngAfterViewChecked() {
    // La selezione è un oggetto che rappresenta una la riga della griglia
    // QueryList non dispone di un indice, cerco in base alla selection il suo Marker e la InfoWindow associata
    if (this.selectionIsChanged && this.markersReady) {
      this.selectionIsChanged = false;
      let selInfoMarker = null;
      if (this.selection) {
        try {
          selInfoMarker = this.listMarkers.find( element => (element.latitude === this.selection.latitude &&
            element.longitude === this.selection.longitude)).infoWindow;
        } catch (e) {

        }
      }
      this.switchMarkerInfo(selInfoMarker);
    }
  }

  // Centra la mappa e effettua il fitting dei Markers
  getCenter(single) {
    // Get center and fit markers in map
    this.mapsAPILoader.load().then(() => {
      this.latlngBounds = new window['google'].maps.LatLngBounds();

      if (!single) {
        this.markers['DataTable'].forEach(location => {
          // const point = new window['google'].maps.LatLng(location.latitude, location.longitude);
          if (location.latitude !== undefined && location.longitude !== undefined) {
            const loc = new window['google'].maps.LatLng(location.latitude, location.longitude);
            this.latlngBounds.extend(loc);
          }
        });
        // if no markers ADS is the center
        if (!this.markers['DataTable']) {
          // const point = new window['google'].maps.LatLng(this.latitude, this.longitude);
          const loc = new window['google'].maps.LatLng(this.latitude, this.longitude);
          this.latlngBounds.extend(loc);
        }

        // this.latitude = (this.latlngBounds.northeast.latitude + this.latlngBounds.southwest.latitude) / 2;
        // this.longitude = (this.latlngBounds.northeast.longitude + this.latlngBounds.southwest.longitude) / 2;
      } else {
        if (single.indexOf(';') > -1) {
          const ll = single.split(';');
          const lat: number = +ll[0];
          const lon: number = +ll[1];
          /* let loc = new window['google'].maps.LatLng(lat - 9, lon - 9);
          this.latlngBounds.extend(loc);
          loc = new window['google'].maps.LatLng(lat + 9, lon + 9);
          this.latlngBounds.extend(loc); */
          this.latitude = lat;
          this.longitude = lon;

          const m = [{
            latitude: lat,
            longitude: lon,
            title: 'Selected'
          }];
          this.markers2 = m;

        }
      }
    });
  }

  // Chiude l'ultima InfoWindow aperta e apre quella attuale
  switchMarkerInfo(infoMarker) {
    console.log('Switch', infoMarker, this.lastInfoMarker);
    // close previouse infoMarker Window
    if (this.lastInfoMarker && this.lastInfoMarker !== infoMarker) {
      this.lastInfoMarker.close();
    }

    if (infoMarker) { infoMarker.open(); }
    this.lastInfoMarker = infoMarker;
  }

  // Espone il marker selezionato
  clickedMarker(marker, infoMarker) {
    this.switchMarkerInfo(infoMarker);
    console.log('Marker from Map', infoMarker);
    // expose event to parent component
    this.markerSelected.emit(marker);
  }

}
