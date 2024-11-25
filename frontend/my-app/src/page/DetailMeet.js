import { useParams } from "react-router-dom";

export default function DetailMeet() {
    const { id } = useParams();
    return <>
    <h1>he he</h1>
        <h2>id:{id}</h2>
    </>
}