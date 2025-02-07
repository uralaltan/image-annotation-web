import {ReactPictureAnnotation} from "react-picture-annotation";
import {useEffect, useState} from "react";
import {useAuthContext} from "../hooks/useAuthContext.js";
import axios from "axios";
import CustomInput from "./CustomInput.jsx";

const baseUrl = process.env.REACT_APP_BASE_URL;
const apiUrl = process.env.REACT_APP_API_URL;

const BBoxAnnotTool = ({tablet}) => {
    
    const {user} = useAuthContext();
    
    const languages = ["Hititçe", "Sümerce", "Akadca", "Hurrice", "Luwice", "Hattice", "Palaca"];
    
    const [data, setData] = useState(tablet.annotations);
    const [saveAlert, setSaveAlert] = useState(false);
    const [langs, setLangs] = useState({});
    const [cols, setCols] = useState({});
    const [rows, setRows] = useState({});
    
    /*
    const [pageSize, setPageSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    
    const onResize = () => {
        setPageSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    useEffect(() => {
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    */
    
    useEffect(() => {
        const preventDefault = (e) => {
            const annotData = document.querySelector('.annot-data');
            if (annotData && (annotData === e.target || annotData.contains(e.target))) {
                return;
            }
            e.preventDefault();
        };
        
        window.addEventListener('wheel', preventDefault, { passive: false });
        
        return () => {
            window.removeEventListener('wheel', preventDefault);
        };
    }, []);
    
    useEffect(() => {
        if(data !== undefined) {
            const tempLangs = {};
            const tempCols = {};
            const tempRows = {};
            // eslint-disable-next-line react/prop-types
            data.forEach((item) => (
                tempLangs[item.id] = item.lang
                //tempCols[item.id] = item.col
            ));
            setLangs(tempLangs);
        }
    }, [data]);
    
    const saveData = async (annot) => {
        const updatedData = annot.map(a => ({
            ...a,
            lang: langs[a.id] || null
        }));
        
        await axios.patch(`${apiUrl}/tablets/${tablet.id}/annotations`, {
            annotations: updatedData
        }, {
            headers: {"Authorization": `Bearer ${user.token}`}
        });
        setSaveAlert(true);
        setTimeout(() => setSaveAlert(false), 500);
    };
    
    const changeStatus = async (status) => {
        await axios.patch(`${apiUrl}/tablets/${tablet.id}/status`, {
            status: status
        }, {
            headers: {"Authorization": `Bearer ${user.token}`}
        }).then().catch();
    };
    
    const onSelect = (selectedId) => {
        if (!selectedId) return;
        
        const selectedElement = document.querySelector(`[data-annotation-id="${selectedId}"]`);
        if (selectedElement) {
            selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
            
            selectedElement.style.backgroundColor = "#fff3cd";
            
            setTimeout(() => {
                selectedElement.style.backgroundColor = '';
            }, 2000);
        }
    };
    
    const onChange = (currentData) => {
        setData(prevData => {
            const updatedData = [...prevData];
            
            const newItems = currentData.filter(item =>
                !prevData.some(prevItem => prevItem.id === item.id)
            );
            
            updatedData.push(...newItems);
            
            updatedData.forEach((item, index) => {
                const currentItem = currentData.find(curr => curr.id === item.id);
                if (currentItem) {
                    updatedData[index] = currentItem;
                }
            });
            
            return updatedData;
        });
    };
    
    const formatAnnotationData = (data) => {
        if (!data || data.length === 0) return null;
        
        return data.map(annotation => ({
            id: annotation.id,
            label: annotation.comment,
            lang: annotation.lang,
            coordinates: {
                x: annotation.mark.x,
                y: annotation.mark.y,
                width: annotation.mark.width,
                height: annotation.mark.height
            }
        }));
    };
    
    const handleLangChange = (id, lang) => {
        setLangs(prev => ({
            ...prev,
            [id]: lang
        }));
        
        setData(prevData =>
            prevData.map(item =>
                item.id === id ? {...item, lang:lang} : item
            )
        )
    };
    
    const deleteBox = async (id) => {
        const annotKey = Object.keys(data).find(key => data[key].id === id);
        data.splice(Number(annotKey), 1);
        await saveData(data);
    };
    
    const undo = async () => {
        data.splice(-1, 1);
        await saveData(data);
    };
    
    const getAnnotationStyle = (lang) => {
        const defaultStyle = style

        switch (lang) {
            case "Hititçe":
                //defaultStyle.shapeShadowStyle = "blue"
                return defaultStyle;
            case "Sümerce":
                //defaultStyle.shapeShadowStyle = "red"
                return defaultStyle;
            case "Akadca":
                //defaultStyle.shapeShadowStyle = "green"
                return defaultStyle;
            default:
                return {defaultStyle}; // Default style
        }
    };
    
    return (
        <div className="bbox-annot">
            <div style={{left: 0, top: 10, display:"flex"}}>
                <ReactPictureAnnotation
                    /* eslint-disable-next-line react/prop-types */
                    image={`${baseUrl}/uploads/${tablet.name}`}
                    onSelect={onSelect}
                    onChange={onChange}
                    width={1300}
                    height={680}
                    scrollSpeed={0.001}
                    annotationData={data}
                    inputElement={(value, onChange, onDelete) => (
                        <CustomInput value={value} onChange={onChange} onDelete={onDelete} onLangChange={handleLangChange} />
                    )}
                />
            </div>
            <div className={"annot-data"} style={{marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "flex-start", right:0}}>
                {saveAlert && <p className={"alert alert-success"} style={{ marginLeft: "10px"}}><strong> <i className={"fa-solid fa-check"}></i> </strong></p>}
                <p> Toplam hece sayısı: {data?.length} </p>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <button className={"btn btn-primary"} accessKey={"s"} onClick={() => saveData(data)}>
                        <i className={"fa-regular fa-floppy-disk"}></i> Save</button>
                    <button className={"btn btn-warning"} style={{marginLeft: 5}} onClick={() => undo()}>
                        <i className={"fa-solid fa-rotate-left"}></i> Undo </button>
                </div>
                <p><strong>------------------------</strong></p>
                <div>
                    {data && formatAnnotationData(data) && formatAnnotationData(data).map((item, index) => (
                        <div key={index} data-annotation-id={item.id} style={{padding: '10px'}}>
                            <p><strong>Label: </strong>{item.label}</p>
                            
                            <p><strong>Lang: </strong>
                                <select
                                    value={langs[item.id] || undefined}
                                    onChange={(e) => {handleLangChange(item.id, e.target.value)}}
                                >
                                    <option value="null">dil seçiniz</option>
                                    {languages && languages.map((lang) => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </p>
                            
                            <p><strong>Satır No: </strong>
                            <input id={"satir-no"} type={"number"}
                            style={{width: 50}}/>
                            </p>
                            
                            <p><strong>Sütun No: </strong>
                            <input id={"satir-no"} type={"number"}
                            style={{width: 50}}/>
                            </p>
                            
                            <button className={"btn btn-danger"} onClick={() => deleteBox(item.id)}>
                                <i className={"fa-solid fa-trash-can"}></i> delete </button>
                            <hr/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    
    );
};
export default BBoxAnnotTool;