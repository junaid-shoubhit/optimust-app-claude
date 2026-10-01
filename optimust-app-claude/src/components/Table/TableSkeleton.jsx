import { Skeleton } from 'primereact/skeleton';

const TableSkeleton = ({ columns, rows = 5 }) => {
    return (
        Array.from({ length: rows || 10 }).map((_, idx) => (
            <div key={idx} className="flex my-2 gap-x-8">
                {Object.keys(columns).map((col) => (
                    <Skeleton key={col} height="1rem" />
                ))}
            </div>
        ))
    );
};

export default TableSkeleton;
