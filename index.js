/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import BackgroundFetch from 'react-native-background-fetch';
import notifee, { EventType } from '@notifee/react-native';
import { setNotification, startNativeAdhaanService } from './src/libs/setNotification';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService, Start } from './service';
import { AppKilledPlaybackBehavior, Capability } from 'react-native-track-player';

// Register background event handler at the top level
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (
    type === EventType.DELIVERED &&
    (!detail.notification.data || detail.notification.data.foreground !== 'true')
  ) {
    startNativeAdhaanService()
  } else if (type === EventType.DISMISSED) {
    console.log('Dismissed');
  }
});

notifee.registerForegroundService(async (notification) => {
  console.log('Foreground service', notification);
  await PlaybackService();
  await Start();
});
  


const myHeadlessTask = async (event) => {
    const { taskId } = event;
    await setNotification();
    console.log('BackgroundFetch event received', event);
    BackgroundFetch.finish(taskId);
}

TrackPlayer.updateOptions({
  android: {
    appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
  },
  capabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.Stop,
  ],
  compactCapabilities: [Capability.Play, Capability.Pause],
});
AppRegistry.registerComponent(appName, () => App);

BackgroundFetch.registerHeadlessTask(myHeadlessTask);

TrackPlayer.registerPlaybackService(() => PlaybackService);

async function startForegroundServiceTest() {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });
  await notifee.displayNotification({
    title: 'Test Foreground',
    body: 'Testing foreground service',
    android: {
      channelId,
      asForegroundService: true,
    },
    data: { foreground: 'true' },
  });
}