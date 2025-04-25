import { useNavigate } from 'react-router-dom';
import PrimaryButton from './PrimaryButton';

import happyHeart from '../assets/images/characters/happy_heart.png';
import happyLungs from '../assets/images/characters/happy_lungs.png';
import happyEar from '../assets/images/characters/happy_ear.png';

type SuccessScreenProps = {
    topicId: string;
    lessonLength: number;
    incorrectIds: number[];
};

export default function SuccessScreen({ topicId, lessonLength, incorrectIds }: SuccessScreenProps) {
    const navigate = useNavigate();

    const getHappyImage = (topicId: string) => {
        switch (topicId.toLowerCase()) {
            case 'heart':
                return happyHeart;
            case 'lungs':
                return happyLungs;
            case 'ear':
                return happyEar;
            default:
                return happyHeart;
        }
    };

    const scoreText =
        incorrectIds.length === 0
            ? 'Perfect score! 🌟'
            : `${lessonLength - incorrectIds.length}/${lessonLength} correct`;

    return (
        <div className="w-full max-w-[480px] mx-auto flex flex-col items-center space-y-6 pt-12 text-center">
            <img
                src={getHappyImage(topicId)}
                alt="Happy organ"
                className="w-2/3 h-auto object-contain"
            />
            <div className="text-2xl font-bold text-white">Lesson complete!</div>
            <div className="text-xl text-white font-bold">{scoreText}</div>

            <PrimaryButton
                variant="cyan"
                active
                className="w-2/3 mx-auto px-8 py-3 flex flex-col items-center text-base font-semibold"
                onClick={() => {
                    localStorage.setItem('lastTopicId', topicId);
                    navigate('/');
                }}
            >
                Back to Menu
            </PrimaryButton>
        </div>
    );
}
