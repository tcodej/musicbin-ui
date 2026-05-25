import '../assets/styles/fakeanim.scss';

export default function FakeAnim({ freeze }) {
	return (
		<div className={'fakeanim'+ (freeze ? ' freeze' : '')}>
			<div />
			<div />
			<div />
		</div>
	)
}
