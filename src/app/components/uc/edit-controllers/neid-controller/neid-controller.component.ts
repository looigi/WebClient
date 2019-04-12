import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ApiService} from '../../../../services/api.service';
import {ControllerBaseComponent} from '../controller-base.component';
import {TuplePlmnTech} from '../../../../models/tuple-plmn-tech.model';
import { MapTechnologyComponent } from './map-technology.component';

@Component({
  selector: 'neid-edit-controller',
  styleUrls: ['neid.css'],
  templateUrl: 'neid.html'
})

export class NeidControllerComponent  extends ControllerBaseComponent implements OnInit {
  static t: NeidControllerComponent;

  @Input() data: any;
  @Input()
  set config (value: any) {
    this.title = value.title || 'NeID';
  }
  name;

  @ViewChild('map') map: MapTechnologyComponent;

  public icoPath = 'assets/img/maps/';
  public icoCust = {'Critical': 'ant_r.png', 'Ok': 'ant_g.png', 'Unk': 'ant_bn.png'};
  public title: string;
  loadingSites;
  loadingTechs;
  loadingTechName;

  sitesList;
  plmnTechList: TuplePlmnTech[];
  sitePlmnTechList: TuplePlmnTech[];

  private sitePlmnTech: TuplePlmnTech;

  public roleTuplePlmnTechList: TuplePlmnTech[] = [];
  private roleTuplePlmnTechListTS: TuplePlmnTech[] = null;
  private techName;

  constructor(private apiService: ApiService) {
    super();
  }

  public getTupleList() {
    return this.roleTuplePlmnTechList;
  }

  ngOnInit() {
    NeidControllerComponent.t = this;
    this.name = this.data.payload.Name.replace(/</g, '').replace(/>/g, '');
    this.getParams();
  }

  private getParams() {
    this.getSites();
    this.getTechs();
    this.getTupleFromPrmList(this.data.payload.PrmList);
  }

  private getSites() {
    this.loadingSites = true;
    this.apiService.getSiteList()
      .map(response => response.json())
      .subscribe(data => {
        this.sitesList = data.DataTable;
        // alert('getSites: ' + data.DataTable);
        this.loadingSites = false;
      }, error => {
        this.sitesList = null;
        this.loadingSites = false;
      });
  }

  private getTechs() {
    this.loadingTechs = true;
    this.apiService.getPlmnTech()
      .map(response => response.json())
      .subscribe(data => {
        this.plmnTechList = data.DataTable.map(tech => {
          const tuple = this.techViewToTuple(tech);
          // alert('getTechs: ' + tuple);
          return tuple;
        });
        this.loadingTechs = false;
      }, error => {
        this.plmnTechList = null;
        this.loadingTechs = false;
      });
  }

  private getSitePlmnTechList(siteId) {
    this.sitePlmnTech = null;
    if (siteId) {
      this.sitePlmnTechList = this.plmnTechList.filter((site) => site['siteId'] === siteId);
    } else {
      this.sitePlmnTechList = null;
    }
  }

  public setSitePlmnTech(tuple: TuplePlmnTech) {
    this.sitePlmnTech = tuple;
  }

  public updateRoleTupleTechList(roleSite) {
    if (!this.sitePlmnTech) {return; };
    const role = this.roleTuplePlmnTechList[roleSite].roleSite;
    this.roleTuplePlmnTechList[roleSite] = Object.assign({}, this.sitePlmnTech);
    this.roleTuplePlmnTechList[roleSite].roleSite = role;
    this.updatePrmList(this.roleTuplePlmnTechList[roleSite]);
    this.submit();
  }

  public resetRoleTupleTechList(roleSite) {
    this.roleTuplePlmnTechList[roleSite] = this.roleTuplePlmnTechListTS[roleSite];
  }

  refresh() {
    this.map.refreshMap();
  }

  techViewToTuple(tech) {
    return <TuplePlmnTech> {
      siteId: tech['SITE_ID'],
      roleSite: null,
      plmnName: tech['OPERATOR_NAME'],
      plmnCode: tech['PLMN_CODE'],
      techName: tech['NETWORK_TECH'],
      techCode: tech['NET_TECH'],
      portStatus: tech['PLMN_PORT_STATUS']
    };
  }

  private getTupleFromPrmList(prmList) {
    this.roleTuplePlmnTechList = prmList.filter(site => site['Name'].includes('.SiteId')).
    map(role => {
      const roleName = role['Name'].substring(1, 2);
      return <TuplePlmnTech> {
        roleSite: roleName,
        siteId: this.getTupleItem(roleName, '.SiteId'),
        plmnCode: this.getTupleItem(roleName, '.Plmn.Code'),
        plmnName: this.getTupleItem(roleName, '.Plmn.Name'),
        techCode: this.getTupleItem(roleName, '.Mobile.NetTech'),
        techName: null
      };
    });
    this.loadingTechName = true;
    this.getTechName();
  }

  private getTechName() {
    let itemCount = 0;
    this.roleTuplePlmnTechList.map(item => {
      const filter = 'TD_PRM_NAME=\'<' + item.roleSite + '.Mobile.NetTech>\' and code=' + item.techCode;
      this.apiService.getLookUpDomainOptions(filter)
        .map(response => response.json())
        .subscribe(data => {
          if (data.RESULT[0].message.toUpperCase() === 'OK') {
            itemCount++;
            item.techName = data.DataTable[0]['VALUE'];
            if (itemCount === this.roleTuplePlmnTechList.length) {
              this.roleTuplePlmnTechListTS = Object.assign([], this.roleTuplePlmnTechList);
              this.loadingTechName = false;
            }
          }
        }, error => {
          itemCount++;
          console.warn(error);
          item.techName = null;
          if (itemCount === this.roleTuplePlmnTechList.length) {
            this.roleTuplePlmnTechListTS = Object.assign({}, this.roleTuplePlmnTechList);
            this.loadingTechName = false;
          }
        });
    });
  }

  updatePrmList(tuple) {
    this.data.payload.PrmList.map(record => {
      if (record['Name'].includes(tuple.roleSite + '.SiteId')) { record['Value'] = tuple.siteId; }
      if (record['Name'].includes(tuple.roleSite + '.Plmn.Code')) { record['Value'] = tuple.plmnCode; }
      if (record['Name'].includes(tuple.roleSite + '.Plmn.Name')) { record['Value'] = tuple.plmnName; }
      if (record['Name'].includes(tuple.roleSite + '.Mobile.NetTech')) { record['Value'] = tuple.techCode; }
    });
  }

  private getTupleItem(role, item) {
    const itemName = role + item;
    const itemValue = this.data.payload.PrmList.filter(site => site['Name'].includes(itemName)).map(value => value['Value'])[0];
    return itemValue;
  }
}
