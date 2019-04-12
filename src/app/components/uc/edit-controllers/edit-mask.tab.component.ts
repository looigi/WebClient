import {
  AfterContentInit, AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {FreetextEditComponent} from './freetext-controller.component';
import {LookupEditComponent} from './lookup-controller.component';
import {NeidControllerComponent} from './neid-controller/neid-controller.component';
import {ControllerBaseComponent} from './controller-base.component';
import {NumberEditComponent} from './number-controller.component';

@Component({
  templateUrl: 'edit-mask.html',
  selector: 'edit-mask-tab'
})

export class EditMaskTabComponent implements  AfterContentInit, AfterViewInit, OnDestroy {
  private controllers;
  private neidContorllerList: NeidControllerComponent[] = [];

  @Input()
  set tabObject(val) {
    this.controllers = val.ControlColl;
  };
  @Output() dynamicDataControll: EventEmitter<any> = new EventEmitter<any>();

  // Get tag child component will be placed
  @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;
  // @ViewChild(NeidControllerComponent) maps: QueryList<NeidControllerComponent>;


  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  refresh() {
    this.neidContorllerList.forEach(ctrl => {
      if ( ctrl instanceof NeidControllerComponent && ctrl.map) {
        ctrl.map.refreshMap();
      }
    });
  }

  // Compile child component
  ngAfterContentInit() {
    for (let i = 0; i < this.controllers.length; i++) {
      const childComponent = this.resolveCcontrollerByDomainType(this.controllers[i].DomainType, this.controllers);
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(childComponent);
      const componentRef = this.target.createComponent(componentFactory);
      (<ControllerBaseComponent | any>componentRef.instance).data = {payload: this.controllers[i]};
      componentRef.instance.submitted.subscribe(dataControll => {
        this.dynamicDataControll.emit(dataControll);
      });
      if (this.controllers[i].DomainType === '18') {
        this.neidContorllerList.push(<NeidControllerComponent>componentRef.instance);
      }
    }
  }


  ngAfterViewInit() {
    // this.componentList.emit(this.componentRefList);
  }


  ngOnDestroy() {
  }

  destroyTab() {
    this.target.detach();
  }

  resolveCcontrollerByDomainType(domainType, c) {
    switch (domainType) {
      case '0':
      case '6':
        return  FreetextEditComponent;
      case '1':
        return  LookupEditComponent;
      case '4':
        return  NumberEditComponent;
      case '18':
        if (!c[0] || !c[0].PrmList || c[0].PrmList.length < 4) {
          return  FreetextEditComponent;
        } else {
          return  NeidControllerComponent;
        }
      default:
        return  FreetextEditComponent;
    }
  }
}
