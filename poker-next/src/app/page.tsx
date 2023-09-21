import Chat from 'src/components/chat';
import Game from 'src/components/pokerGame';

let _chats: string[];
_chats = [];

_chats.push("test1");

export default function Home() {
  	return (
    	<main className="flex min-h-screen flex-row items-center">
			<div className='flex min-h-screen w-9/12 max-h-screen'>
				<Game />
			</div>
			<div className = 'flex min-h-screen w-3/12 max-h-screen'>
				<Chat _chats={_chats}/>
			</div>
    	</main>
  	)
}
