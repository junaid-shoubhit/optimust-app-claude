import React from 'react'
import { Button } from 'primereact/button';
import './CustomButton.scss';
const CustomButton = ({ className, ...props }) => {
    return (
        <Button iconPos='right' type='submit' className={className} {...props} />
    )
}

export default CustomButton