import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle, BrainCircuit, RotateCcw, Trophy, Star } from 'lucide-react';

// Card Match Game Component
const CardMatchGame = () => {
    const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐'];
    const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [gameWon, setGameWon] = useState(false);

    const initializeGame = useCallback(() => {
        const shuffled = [...emojis, ...emojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));
        setCards(shuffled);
        setFlippedCards([]);
        setMoves(0);
        setGameWon(false);
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    useEffect(() => {
        if (flippedCards.length === 2) {
            const [first, second] = flippedCards;
            if (cards[first].emoji === cards[second].emoji) {
                setCards(prev => prev.map((card, idx) =>
                    idx === first || idx === second ? { ...card, matched: true } : card
                ));
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map((card, idx) =>
                        idx === first || idx === second ? { ...card, flipped: false } : card
                    ));
                }, 1000);
            }
            setTimeout(() => setFlippedCards([]), 1000);
            setMoves(m => m + 1);
        }
    }, [flippedCards, cards]);

    useEffect(() => {
        if (cards.length > 0 && cards.every(card => card.matched)) {
            setGameWon(true);
        }
    }, [cards]);

    const handleCardClick = (index: number) => {
        if (flippedCards.length === 2 || cards[index].flipped || cards[index].matched) return;
        setCards(prev => prev.map((card, idx) =>
            idx === index ? { ...card, flipped: true } : card
        ));
        setFlippedCards(prev => [...prev, index]);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-muted-foreground">Moves: {moves}</span>
                <Button variant="outline" size="sm" onClick={initializeGame}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
            </div>

            {gameWon ? (
                <div className="bg-green-100 p-8 rounded-lg text-center">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-800">You Won!</h3>
                    <p className="text-green-600">Completed in {moves} moves</p>
                    <Button className="mt-4" onClick={initializeGame}>Play Again</Button>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-3">
                    {cards.map((card, index) => (
                        <button
                            key={card.id}
                            onClick={() => handleCardClick(index)}
                            className={`aspect-square rounded-lg text-4xl flex items-center justify-center transition-all transform ${card.flipped || card.matched
                                    ? 'bg-white border-2 border-purple-300 rotate-0'
                                    : 'bg-purple-500 hover:bg-purple-600 rotate-0'
                                } ${card.matched ? 'opacity-50' : ''}`}
                            disabled={card.matched}
                        >
                            {card.flipped || card.matched ? card.emoji : '❓'}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Sequence Game Component
const SequenceGame = () => {
    const [sequence, setSequence] = useState<number[]>([]);
    const [playerSequence, setPlayerSequence] = useState<number[]>([]);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

    const startGame = () => {
        setSequence([]);
        setPlayerSequence([]);
        setScore(0);
        setGameOver(false);
        setGameStarted(true);
        addToSequence([]);
    };

    const addToSequence = (currentSequence: number[]) => {
        const newNum = Math.floor(Math.random() * 4);
        const newSequence = [...currentSequence, newNum];
        setSequence(newSequence);
        playSequence(newSequence);
    };

    const playSequence = async (seq: number[]) => {
        setIsShowingSequence(true);
        for (let i = 0; i < seq.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 600));
            setActiveButton(seq[i]);
            await new Promise(resolve => setTimeout(resolve, 400));
            setActiveButton(null);
        }
        setIsShowingSequence(false);
        setPlayerSequence([]);
    };

    const handleButtonClick = (index: number) => {
        if (isShowingSequence || gameOver) return;

        const newPlayerSequence = [...playerSequence, index];
        setPlayerSequence(newPlayerSequence);

        // Check if correct
        if (sequence[newPlayerSequence.length - 1] !== index) {
            setGameOver(true);
            return;
        }

        // Check if completed round
        if (newPlayerSequence.length === sequence.length) {
            setScore(s => s + 1);
            setTimeout(() => addToSequence(sequence), 1000);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" /> Score: {score}
                </span>
                {gameStarted && (
                    <Button variant="outline" size="sm" onClick={startGame}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Restart
                    </Button>
                )}
            </div>

            {gameOver ? (
                <div className="bg-rose-100 p-8 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-rose-800">Game Over!</h3>
                    <p className="text-rose-600">Your score: {score}</p>
                    <Button className="mt-4" onClick={startGame}>Try Again</Button>
                </div>
            ) : !gameStarted ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Watch the sequence and repeat it!</p>
                    <Button size="lg" onClick={startGame}>
                        <PlayCircle className="w-5 h-5 mr-2" /> Start Game
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map(index => (
                        <button
                            key={index}
                            onClick={() => handleButtonClick(index)}
                            disabled={isShowingSequence}
                            className={`h-24 rounded-lg transition-all ${colors[index]} ${activeButton === index ? 'opacity-100 scale-105 ring-4 ring-white' : 'opacity-70 hover:opacity-90'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const Games = () => {
    const [activeGame, setActiveGame] = useState<'none' | 'match' | 'sequence'>('none');

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-4 max-w-4xl">
                <Link to="/patient/dashboard" className="flex items-center text-primary mb-6 hover:text-primary/80">
                    <ArrowLeft className="mr-2" /> Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-foreground mb-6">Memory Games</h1>

                {activeGame === 'none' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="border-t-8 border-t-purple-500 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
                                    <BrainCircuit className="text-purple-600" /> Card Match
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-purple-100 rounded-lg h-48 flex items-center justify-center">
                                    <span className="text-purple-400 text-6xl">🎴</span>
                                </div>
                                <p className="text-muted-foreground">Flip cards to find matching pairs! Good for memory retention.</p>
                                <Button className="w-full bg-purple-600 hover:bg-purple-700 font-bold text-lg py-6" onClick={() => setActiveGame('match')}>
                                    <PlayCircle className="mr-2" /> Play Now
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-t-8 border-t-pink-500 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
                                    <BrainCircuit className="text-pink-600" /> Sequence Finder
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-pink-100 rounded-lg h-48 flex items-center justify-center">
                                    <span className="text-pink-400 text-6xl">🔴🔵🟢🟡</span>
                                </div>
                                <p className="text-muted-foreground">Remember the order of colors and tap them correctly.</p>
                                <Button className="w-full bg-pink-600 hover:bg-pink-700 font-bold text-lg py-6" onClick={() => setActiveGame('sequence')}>
                                    <PlayCircle className="mr-2" /> Play Now
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div>
                        <Button variant="ghost" onClick={() => setActiveGame('none')} className="mb-4">
                            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Games
                        </Button>
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BrainCircuit className={activeGame === 'match' ? 'text-purple-600' : 'text-pink-600'} />
                                    {activeGame === 'match' ? 'Card Match' : 'Sequence Finder'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {activeGame === 'match' ? <CardMatchGame /> : <SequenceGame />}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Games;
