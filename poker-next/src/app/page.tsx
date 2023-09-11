import Chat from 'src/components/chat';
import Game from 'src/components/pokerGame';

export default function Home() {
  	return (
    	<main className="flex min-h-screen flex-row items-center">
			<div className='flex min-h-screen w-9/12 bg-red-400'>
				<Game />
			</div>
			<div className = 'flex min-h-screen w-3/12 bg-blue-400 max-h-screen'>
				<Chat />
			</div>
    	</main>
  	)
}