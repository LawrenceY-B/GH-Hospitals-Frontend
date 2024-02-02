import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../environments/environment';
import { ApiService } from './shared/services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'GH-Hospitals-Frontend';
  latitude!: number;
  longitude!: number;
  ownwership!: string[];
  constructor(private api:ApiService) {
  this.api.getOwnwership().subscribe({
    next: (data) => {
      this.ownwership = data.data;
      console.log(this.ownwership);
    },
    error: (error) => {
      console.error('There was an error!', error);
    }
  })

  }
  ngOnInit() {
    navigator.geolocation.getCurrentPosition(async (position) => {
      if (position) {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      }
    });
    // let loader = new Loader({
    //   apiKey: environment.googleApiKey,
    //   version: 'weekly',
    // });

    // loader.load().then(() => {
    //   new google.maps.Map(document.getElementById('map') as HTMLElement, {
    //     center: { lat:this.latitude, lng:this.longitude },
    //     zoom: 15,
    //     mapId: environment.googleMapId,
    //     mapTypeControl: false,
    //     streetViewControl: false,
    //   });
    // });
  }
}
