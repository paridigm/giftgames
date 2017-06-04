import {Component, OnDestroy} from '@angular/core';
import { Subscription }   from 'rxjs/Subscription';

/*
import { AssetService } from '../services/asset.service';
import { UpdateService } from '../services/update.service';
import { FeatureService } from '../services/feature.service';
*/

declare var __phaser: any;      // phaser game js code container object
declare var OnLoadGlobal: any;  // __phaser calls this when done loading

@Component({
    selector: 'phaser-game',
    templateUrl: './phaserGame.component.html',
})
export class PhaserGameComponent implements OnDestroy {

  spritePath: string;
  subscription: Subscription;  // subscription to update

  constructor(/*private assetService: AssetService,
              private updateService: UpdateService,
              private featureService: FeatureService*/ ) {

    // using this syntax --> this='on-load-global object' :(
    // OnLoadGlobal.callback = this.onPhaserGameJsLoaded();

    // using pointer function kept the this context to this='component' :)
    OnLoadGlobal.callback = (params: any) => {
        this.onPhaserGameJsLoaded({});
    }

    // dynamically load a game js file
    console.log('preparing to load phaser game script...');
    let gameJsNode = document.createElement('script');
    gameJsNode.src = 'game-demo.js';  // select the js game code here
    gameJsNode.type = 'text/javascript';
    gameJsNode.async = true;
    gameJsNode.charset = 'utf-8';
    document.body.appendChild(gameJsNode);

  }

  onPhaserGameJsLoaded(params: any) {
    console.log('game script loaded');

    // initialize game
    __phaser.game.init(null, this);

    /*
    // subscribe to the updateService onUpdate Observable
    this.subscription = this.updateService.onUpdate$.subscribe(
      data => {
        // update game callback
        __phaser.game.updateFeature(data);
    });

    // At this point the features are accessible --> update the features service
    this.featureService.sendFeatures( __phaser.game.features );
    */

    // TODO: at this point, if there is a features.json available, then load those features instead
    // I think we have to load one at a time...

  }

  ngOnInit() {

  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.subscription.unsubscribe();
  }

  destroyGame() {
    __phaser.destroyGame(function(){
      // extra code to run when game is destroyed
    });
  }

}
