import PrimaryButton from './PrimaryButton';

type FeedbackButtonProps = {
    evaluation: string;
    explanation?: string;
    onContinue: () => void;
    correct: boolean;
};

export default function FeedbackButton({ evaluation, explanation, onContinue, correct }: FeedbackButtonProps) {
    return (
        <PrimaryButton
            onClick={onContinue}
            variant={correct ? 'cyan' : 'white'}
            active
            className="w-2/3 mx-auto px-6 py-4 flex flex-col items-center space-y-2 text-base"
        >
            {/* Top: Evaluation text */}
            <span className="font-bold text-center">
                {evaluation}
            </span>

            {/* Middle: Optional explanation text */}
            {explanation && (
                <span className="font-normal text-justify">
                    {explanation}
                </span>
            )}

            {/* Bottom: Continue */}
            <span className="font-bold text-center">
                Continue
            </span>
        </PrimaryButton>
    );
}
