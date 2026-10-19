export default function MetricCard({ titulo, valor, color = "azul" }) {
    return (
        <article className={`metric-card metric-${color}`}>
            <h2>{titulo}</h2>
            <p>{valor}</p>
        </article>
    );
}