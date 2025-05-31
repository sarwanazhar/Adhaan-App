// service.js
import TrackPlayer, { Event, RepeatMode } from 'react-native-track-player';
import { tracks } from './src/constants';

export async function setupPlayer() {
  await TrackPlayer.setupPlayer();
  return true;
}

export async function addTracks() {
  await TrackPlayer.add(tracks);
  await TrackPlayer.setRepeatMode(RepeatMode.Off);
}

export async function Start(){
  await TrackPlayer.setupPlayer();
  await TrackPlayer.add(tracks);
  await TrackPlayer.setRepeatMode(RepeatMode.Off);
  await TrackPlayer.play();
}

export async function PlaybackService() {  
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });
}
