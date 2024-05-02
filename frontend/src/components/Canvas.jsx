import {useRef, useState, useEffect } from "react";
import PolygonAnnotation from "./PolygonAnnotation.jsx";
import { Stage, Layer, Image } from "react-konva";
import Button from "./Button.jsx";
import {useParams} from "react-router-dom";

const wrapperStyle = {
    display: "flex",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "aliceblue",
};
const columnStyle = {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "aliceblue",
};

const Canvas = () => {
    const [image, setImage] = useState();
    const imageRef = useRef(null);
    const dataRef = useRef(null);
    const [points, setPoints] = useState([]);
    const [size, setSize] = useState({});
    const [flattenedPoints, setFlattenedPoints] = useState();
    const [position, setPosition] = useState([0, 0]);
    const [isMouseOverPoint, setMouseOverPoint] = useState(false);
    const [isPolyComplete, setPolyComplete] = useState(false);
    
    const { tabletName } = useParams()
    const videoSource = "/images/" + tabletName
    
    useEffect(() => {
        const imageObj = new window.Image()
        imageObj.src = videoSource;
        imageObj.onload = () => {
            setSize({
                width: imageObj.width,
                height: imageObj.height,
            });
            setImage(imageObj)
            imageRef.current.cache();
            imageRef.current.getLayer().batchDraw();
        };
    }, []);


    const getMousePos = (stage) => {
        return [stage.getPointerPosition().x, stage.getPointerPosition().y];
    };

    //drawing begins when mousedown event fires.
    const handleMouseDown = (e) => {
        const stage = e.target.getStage();
        const mousePos = getMousePos(stage);
        
        if (isPolyComplete) { return }
        
        if (isMouseOverPoint && points.length >= 3) {
            setPolyComplete(true);
        } else {
            setPoints([...points, mousePos]);
        }
    };
    const handleMouseMove = (e) => {
        const stage = e.target.getStage();
        const mousePos = getMousePos(stage);
        setPosition(mousePos);
    };
    const handleMouseOverStartPoint = (e) => {
        if (isPolyComplete || points.length < 3) return;
        e.target.scale({ x: 3, y: 3 });
        setMouseOverPoint(true);
    };
    const handleMouseOutStartPoint = (e) => {
        e.target.scale({ x: 1, y: 1 });
        setMouseOverPoint(false);
    };
    const handlePointDragMove = (e) => {
        const stage = e.target.getStage();
        const index = e.target.index - 1;
        const pos = [e.target._lastPos.x, e.target._lastPos.y];
        if (pos[0] < 0) pos[0] = 0;
        if (pos[1] < 0) pos[1] = 0;
        if (pos[0] > stage.width()) pos[0] = stage.width();
        if (pos[1] > stage.height()) pos[1] = stage.height();
        setPoints([...points.slice(0, index), pos, ...points.slice(index + 1)]);
    };
    
    useEffect(() => {
        setFlattenedPoints(
            points
            .concat(isPolyComplete ? [] : position)
            .reduce((a, b) => a.concat(b), [])
        );
    }, [points, isPolyComplete, position]);
    const undo = () => {
        setPoints(points.slice(0, -1));
        setPolyComplete(false);
        setPosition(points[points.length - 1]);
    };
    const reset = () => {
        setPoints([]);
        setPolyComplete(false);
    };
    const handleGroupDragEnd = (e) => {
        //drag end listens other children circles' drag end event
        //...that's, why 'name' attr is added, see in polygon annotation part
        if (e.target.name() === "polygon") {
            let result = [];
            let copyPoints = [...points];
            copyPoints.map((point) =>
                result.push([point[0] + e.target.x(), point[1] + e.target.y()])
            );
            e.target.position({ x: 0, y: 0 }); //needs for mouse position otherwise when click undo you will see that mouse click position is not normal:)
            setPoints(result);
        }
    };
    
    const renderAnnotations = () => {
    return (
        <PolygonAnnotation
            points={points}
            flattenedPoints={flattenedPoints}
            handlePointDragMove={handlePointDragMove}
            handleGroupDragEnd={handleGroupDragEnd}
            handleMouseOverStartPoint={handleMouseOverStartPoint}
            handleMouseOutStartPoint={handleMouseOutStartPoint}
            isFinished={isPolyComplete}
        />)
    }

    return (
        <div style={wrapperStyle}>
            <div style={columnStyle}>
                <Stage
                    width={size.width}
                    height={size.height}
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                >
                    <Layer>
                        <Image
                            ref={imageRef}
                            image={image}
                            x={0}
                            y={0}
                            width={size.width}
                            height={size.height}
                        />
                        {renderAnnotations()}
                    </Layer>
                </Stage>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Button name="Noktayı Geri Al" onClick={undo} />
                    <Button name="Hepsini Resetle" onClick={() => window.confirm("Tüm annotationları silmek istediğinize emin misiniz ?") && reset()} />
                </div>
            </div>
            <div
                ref={dataRef}
                style={{
                    width: 375,
                    height: 302,
                    boxShadow: ".5px .5px 5px .4em rgba(0,0,0,.1)",
                    marginTop: 20,
                }}
            >
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(points)}</pre>
            </div>
        </div>
    );
};

export default Canvas;