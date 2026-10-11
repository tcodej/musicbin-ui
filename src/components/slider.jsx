import { Root, Track, Range, Thumb } from '@radix-ui/react-slider';

export default function Slider(props) {
  return (
    <Root className={'SliderRoot'+ (props.monochrome ? ' monochrome' : '')} {...props}>
      <Track className="SliderTrack">
        <Range className="SliderRange" />
      </Track>
      <Thumb className="SliderThumb" />
    </Root>
  );
}