import { FourInarowBoard } from "@/backend/games/fourInarowGame";
import { FourInarowAction, FourInarowGameState, GameEvent, GameStream } from "@/types/types";
import useSocket from "@/util/socket";
import { Environment, OrbitControls, OrbitControlsProps, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { data } from "cypress/types/jquery";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useRef, useState } from "react";
import { Camera, Color, Euler, Mesh, Object3D, Vector3 } from "three";

export default function FourInarowGame({ gameId, spectating }: { gameId: string, spectating: boolean }) {

    const controlsRef = useRef<any | null>(null);
    const socket = useSocket();
    const session = useSession();
    const [board, setBoard] = useState<number[][]>();
    const [playerPos, setPlayerPos] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const parseGameState = (gameState: FourInarowGameState) => {
        console.log(gameState)
        setBoard(gameState.board)
        setPlayerPos(gameState.yourPosition)
    }


    const actionUpdate = (data: GameStream) => {
        socket?.emit("getGameState", { gameId: gameId, userId: session.data?.user.id }, (res: any) => {
            parseGameState(res.gameState)
        })
    }

    useEffect(() => {
        socket?.emit("getGameState", { gameId: gameId, userId: session.data?.user.id }, (res: any) => {
            parseGameState(res.gameState)
            setLoading(false)
        })


        socket?.on("gameStream", (data: GameStream) => {
            console.log("gamestream")
            console.log(data)
            switch (data.event) {
                case GameEvent.ACTION:
                    actionUpdate(data)
                    break;
                case GameEvent.WIN:
                    break;
                default:
                    break;
            }
        })

        return () => {
            socket?.off("gameStream")
        }
    }, [])

    useEffect(() => {
        console.log(controlsRef.current)
    }, [controlsRef])

    const placePiece = (column: number) => {
        socket?.emit("performGameAction", {
            gameId: gameId,
            userId: session.data?.user.id,
            action: {
                action: "place",
                data: {
                    column: column
                }
            } as FourInarowAction
        }, (res: any) => {
            console.log(res)
        }
        )
    }

    if (loading) return (
        <div>Loading...

        </div>
    )

    return (
        <div className="w-full h-full ml-20 flex justify-center">
            <Canvas>
                <Environment preset='city' backgroundIntensity={0.3} />
                {/* lighting */}
                <ambientLight intensity={1} />
                <spotLight position={[10, 15, 10]} angle={0.3} />
                <pointLight position={[-10, -10, -10]} />

                {/* Camera */}
                <OrbitControls
                    ref={controlsRef}
                    minDistance={12}
                    makeDefault
                    target={[0, -1, 1]}
                />

                {/* Game content */}
                <Suspense fallback={null}>
                    <group position={[0, -2, -2]}>
                        <Board
                            width={7}
                            height={6}
                            board={board}
                            onBoardClick={placePiece}
                            playerPos={playerPos}
                        />
                    </group>
                </Suspense>
            </Canvas>
        </div>
    )
}

function Board({ width, height, board, playerPos, onBoardClick }: { width: number, height: number, board?: number[][], playerPos: number, onBoardClick: (column: number) => void }) {
    const [canPlacePiece, setCanPlacePiece] = useState(true);
    const [currentCollumn, setCurrentCollumn] = useState(-1);
    const socket = useSocket();

    const { scene } = useGLTF("/gltf/fourinarow_board.glb");
    scene.position.set(7, -4, 0)

    const onBoardHover = (column: number) => {
        setCurrentCollumn(column);
    }

    const onBoardHoverLeave = (column: number) => {
        if (!(column === 0 || column === width - 1)) return;
        if (currentCollumn !== column) return;
        setCurrentCollumn(-1);
    }

    let size = new Vector3();

    scene.traverse((child) => {
        if (child instanceof Mesh) {
            child.geometry?.computeBoundingBox();
            child.setRotationFromEuler(new Euler(0, Math.PI / 2, 0))
            let newSize: Vector3 = child.geometry.boundingBox?.getSize(new Vector3()) as Vector3;

            if (newSize.length() > size.length()) {
                size = newSize;
            }
        }
    })

    const triggerOffset = size.z / width / 2

    return (
        <group>
            {
                // Pointer triggers
                Array.from({ length: width }).map((_, i) => (
                    <mesh
                        onClick={() => {
                            console.log("click1")
                            if (currentCollumn === -1 || !canPlacePiece) return;
                            onBoardClick?.(currentCollumn)
                        }}
                        key={i}
                        position={[i * 2 - width + triggerOffset, 0, 0]}
                        onPointerEnter={() => onBoardHover(i)}
                        onPointerLeave={() => onBoardHoverLeave(i)}
                    >
                        <boxGeometry args={[2, size.y * 2, 1]} />
                        <meshStandardMaterial transparent opacity={0} />
                    </mesh>
                ))
            }

            {
                // Placing pieces
                (canPlacePiece && currentCollumn !== -1) && (
                    <group position={[size.x * currentCollumn * 2 - (size.y / 2), 8.5, -0.5]}>
                        <Piece playerNum={playerPos} />
                    </group>
                )
            }

            {
                // Board
                (board) && (
                    <group position={[- (size.y / 2), 7, -0.5]}>
                        {
                            board.map((row, i) => (
                                row.map((piece, j) => (
                                    piece !== 0 &&
                                    <group key={i + j} position={[j * 2, -i * 2, 0]}>
                                        <Piece playerNum={piece - 1} />
                                    </group>
                                ))
                            ))
                        }
                    </group>
                )
            }

            <primitive object={scene} />


        </group>
    )
}

function Piece({ playerNum }: { playerNum: number }) {
    const PieceColor = [
        Color.NAMES.red,
        Color.NAMES.yellow,
        Color.NAMES.green,
        Color.NAMES.coral,
        Color.NAMES.purple,
        Color.NAMES.orange,
        Color.NAMES.brown,
        Color.NAMES.thistle
    ]

    return (
        <mesh rotation={new Euler(Math.PI / 2, 0, 0)}>
            <cylinderGeometry args={[0.8, 0.8, 0.4]} />
            <meshStandardMaterial color={PieceColor[playerNum]} />
        </mesh>
    )
}