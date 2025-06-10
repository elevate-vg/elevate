import React from "react";
import {
	useFocusable,
	setFocus,
} from "@noriginmedia/norigin-spatial-navigation";

interface TestButtonsProps {
	onTestQuery: () => void;
	onTestMutation: () => void;
	onLaunchZelda: () => void;
	onWriteYaml: () => void;
	onReadYaml: () => void;
	isLoading: boolean;
}

interface FocusableButtonProps {
	onClick: () => void;
	disabled: boolean;
	children: React.ReactNode;
	focusKey?: string;
}

function FocusableButton({
	onClick,
	disabled,
	children,
	focusKey,
}: FocusableButtonProps) {
	const { ref, focused } = useFocusable({
		focusKey,
		onEnterPress: () => {
			// console.log('Enter pressed on:', focusKey);
			if (!disabled) {
				onClick();
			}
		},
	});

	// console.log('FocusableButton render:', focusKey, 'focused:', focused);

	return (
		<button
			ref={ref}
			className={`button ${focused ? "button-focused" : ""}`}
			onClick={onClick}
			onMouseEnter={() => focusKey && setFocus(focusKey)}
			disabled={disabled}
			tabIndex={-1}
		>
			{children}
		</button>
	);
}

export function TestButtons({
	onTestQuery,
	onTestMutation,
	onLaunchZelda,
	onWriteYaml,
	onReadYaml,
	isLoading,
}: TestButtonsProps) {
	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
			<FocusableButton
				focusKey="test-query"
				onClick={onTestQuery}
				disabled={isLoading}
			>
				Test Query (hello)
			</FocusableButton>
			<FocusableButton
				focusKey="test-mutation"
				onClick={onTestMutation}
				disabled={isLoading}
			>
				Test Mutation (echo)
			</FocusableButton>
			<FocusableButton
				focusKey="launch-zelda"
				onClick={onLaunchZelda}
				disabled={isLoading}
			>
				🎮 Launch Zelda: Minish Cap
			</FocusableButton>
			<FocusableButton
				focusKey="write-yaml"
				onClick={onWriteYaml}
				disabled={isLoading}
			>
				📝 Write YAML File
			</FocusableButton>
			<FocusableButton
				focusKey="read-yaml"
				onClick={onReadYaml}
				disabled={isLoading}
			>
				📖 Read YAML File
			</FocusableButton>
		</div>
	);
}
