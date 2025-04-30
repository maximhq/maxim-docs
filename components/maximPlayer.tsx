interface Props {
	url: string;
}

export function MaximPlayer(props: Props) {
	return (
		<iframe
			className="border-background-highlight-secondary h-full w-full rounded-md border-2"
			src={props.url}
			allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
		></iframe>
	);
}
