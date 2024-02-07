import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../environments/environment';
import { ApiService } from './shared/services/api.service';
import { Observable, debounceTime, distinctUntilChanged, map } from 'rxjs';
import {
  FormControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IFilter,
  ISearch,
  ITown,
  ITownResponse,
} from './shared/types/responses.types';
import { CommonModule } from '@angular/common';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'GH-Hospitals-Frontend';
  latitude!: number;
  longitude!: number;
  search = false;
  allHospitals: ISearch[] = [];
  ownwership!: string[];
  types!: string[];
  townList: string[] = [];
  selectedSearch!: string;
  selectedTown!: string;
  searchResults: ISearch[] = [];
  filteredResults: ISearch[] = [];
  filter = this.fb.group({
    ownership: ['', Validators.required],
    type: ['', Validators.required],
    town: ['', Validators.required],
  });
  hospital = this.fb.group({
    search: [''],
  });
  constructor(private api: ApiService, private fb: NonNullableFormBuilder) {
    this.fetchOwnwership();
    this.fetchType();
    this.debounce();
    this.debounceSearch();
    this.getallHospitals();
  }
  loader = new Loader({
    apiKey: environment.googleApiKey,
    version: 'weekly',
  });
  async ngOnInit() {
    await this.loader.load();
    const glyphImg = document.createElement('img');
    glyphImg.src = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/google_logo_g.svg';
    glyphImg.style.width = '50px';
    glyphImg.style.height = '50px';

    let position: GeolocationPosition = await this.getCoordinates();
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;

    const { Map, InfoWindow } = await this.loader.importLibrary('maps');
    const { AdvancedMarkerElement, PinElement } = await this.loader.importLibrary(
      'marker'
    );

    const mapOptions = {
      center: new google.maps.LatLng(this.latitude, this.longitude),
      zoom: 15,
      mapId: environment.googleMapId,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    };
    const map = new Map(document.getElementById('map')!, mapOptions);
    const infoWindow = new InfoWindow({
      content: '',
      disableAutoPan: true,
    });

    const markers = this.allHospitals.map((position) => {
      const lat = parseFloat(position.Latitude);
      const lng = parseFloat(position.Longitude);
      console.log(lat, lng);
      const label = position.FacilityName;
      const pinGlyph = new PinElement({
        glyphColor: 'white',
      });
      const marker = new AdvancedMarkerElement({
        position: new google.maps.LatLng(lat, lng),
        content: pinGlyph.element,
      });
      marker.addListener('click', () => {
        infoWindow.setContent(`
        <p><strong>${label}</strong></p>
        <p>${position.Latitude}, ${position.Longitude}</p>
        <p>${position.Region},${position.Town}</p>`);
        infoWindow.open(map, marker);
      });
      return marker;
    });
    const cluster=new MarkerClusterer({ markers, map });
    console.log(cluster)
  }

  fetchOwnwership() {
    this.api.getOwnwership().subscribe({
      next: (data) => {
        this.ownwership = data.data;
      },
      error: (error) => {
        console.error('There was an error!', error);
      },
    });
  }
  fetchType() {
    this.api.getType().subscribe({
      next: (data) => {
        this.types = data.data;
      },
      error: (error) => {
        console.error('There was an error!', error);
      },
    });
  }
  fetchTown() {
    this.api.getTown(this.filter.get('town')!.value).subscribe({
      next: (data) => {
        this.townList = data.data;
      },
      error: (error) => {
        if (error.error.message === 'No Town found') {
          this.townList = [];
        } else {
          console.error('There was an error!', error);
        }
      },
    });
  }
  debounce() {
    this.filter
      .get('town')!
      .valueChanges.pipe(debounceTime(900), distinctUntilChanged())
      .subscribe((value) => {
        if (this.selectedTown === value) {
          return;
        }
        this.fetchTown();
      });
  }
  select(town: string) {
    this.selectedTown = town;
    this.filter.get('town')!.setValue(town);
    this.townList = [];
  }
  displaySearch() {
    this.search = !this.search;
  }
  searchHospital() {
    const name = this.hospital.value.search as string;
    this.api.searchHospitals(name).subscribe({
      next: (response) => {
        this.searchResults = response.data;
        console.log(this.searchResults);
      },
      error: (error) => {
        if (error.error.message === 'No hospital found') {
          this.searchResults = [];
        }
        console.error('There was an error!', error);
      },
    });
  }
  debounceSearch() {
    this.hospital
      .get('search')!
      .valueChanges.pipe(debounceTime(900), distinctUntilChanged())
      .subscribe((value) => {
        if (this.selectedSearch === value) {
          return;
        }
        this.searchHospital();
      });
  }
  selectSearch(hospital: string) {
    this.selectedSearch = hospital;
    this.hospital.get('search')!.setValue(hospital);
    this.searchResults = [];
  }
  filterHospital() {
    const data = this.filter.value;
    const param: IFilter = {
      ownership: data.ownership as string,
      type: data.type as string,
      town: data.town as string,
    };
    console.log(param);
    this.api.filterHospitals(param).subscribe({
      next: (response) => {
        this.filteredResults = response.data;
        console.table(this.filteredResults);
      },
      error: (error) => {
        if (error.error.message === 'No hospital found') {
          this.searchResults = [];
          console.log('No Hospital Found');
        } else {
          console.error('There was an error!', error);
        }
      },
    });
  }

  getCoordinates() {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((position) => {
        if (position) {
          resolve(position);
        } else {
          reject('Error');
        }
      });
    });
  }
  getallHospitals() {
    this.api.getallHospitals().subscribe({
      next: (response) => {
        this.allHospitals = response.data;
      },
      error: (err) => {
        console.log(err.error.message);
      },
    });
  }
}

//api integration for search and filter
// const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
