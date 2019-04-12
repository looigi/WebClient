import {AfterViewInit, Component, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {ModalDirective} from 'ngx-bootstrap';

@Component({
  selector: 'sim-cat-edit-controller',
  templateUrl: 'simcategory-controller.html'

})
export class SIMCategoryControllerComponent implements OnInit, AfterViewInit {

  loadingSimCat;
  SIMList;
  public isMapShown = false;
  @ViewChild('mapModal') public mapModal: ModalDirective;
  constructor(private apiservice: ApiService) {

  }

  showMap() {
    this.isMapShown = true;
  }
  public hideMap(): void {
    this.isMapShown = false;
  }


  getSIM() {
    this.loadingSimCat = true;
    this.apiservice.getSIMCategories()
      .map(response => response.json())
      .subscribe(data => {
        // console.log("sim scaricate");
        this.SIMList = data.DataTable;
        this.loadingSimCat = false;
      }, error => {
        this.SIMList = null;
        console.warn(error);
        this.loadingSimCat = false;
      });
  }

  getFormParameters() {
   this.getSIM();
  }


  ngOnInit() {
    // console.log('neid editor inizializzato');
    this.getFormParameters();

  }

  ngAfterViewInit() {

  }


}
