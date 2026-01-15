import ProductCard from '@/components/ProductCard';
import { getUniqueProducts } from '@/lib/product-utils';

export const dynamic = 'force-dynamic';

export default function GalleryPage() {
    const products = getUniqueProducts();

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <section className="text-center mb-16">
                <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mb-6">
                    Full Collection
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Browser the complete collection of fine art photography.
                </p>
            </section>

            <section>
                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500">Nenhum produto disponível no momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
