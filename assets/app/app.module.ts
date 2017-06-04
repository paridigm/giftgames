import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgUploaderModule } from 'ngx-uploader';

import { AppComponent } from "./app.component";
import { UploadPromptComponent } from "./uploadPrompt/uploadPrompt.component";
import { PhaserGameComponent } from "./phaserGame/phaserGame.component";

@NgModule({
    declarations: [
        AppComponent,
        UploadPromptComponent,
        PhaserGameComponent
    ],
    imports: [BrowserModule, NgUploaderModule],
    bootstrap: [AppComponent]
})
export class AppModule {

}
