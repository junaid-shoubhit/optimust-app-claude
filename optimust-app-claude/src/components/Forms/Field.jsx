import { Controller } from "react-hook-form";

const Index = (props) => {
    return (
        // <div className={props?.className}>
            <Controller
                {...props?.controller}
            />
        // </div>
    );
};

export default Index;