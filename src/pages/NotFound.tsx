
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="container-custom py-24 flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold text-job-blue mb-4">404</div>
          <h1 className="text-4xl font-bold mb-4">Page non trouvée</h1>
          <p className="text-xl text-job-gray mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        <Link to="/">
          <Button className="btn-primary">Retour à l'accueil</Button>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
