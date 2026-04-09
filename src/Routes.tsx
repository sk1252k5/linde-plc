import {type RouteObject} from 'react-router-dom';
import Layout from './components/Layout';
import App from './App';
export const Routes: RouteObject[] = [
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <App />
            }
        ]
    }
 ]