import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  SelectChangeEvent,
  Table,
  TableBody,
  TableContainer,
  useMediaQuery,
  useTheme,
  Paper,
  Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { EditarOficioModal } from '..';
import AdicionarOficioModal from '../components/AdicionarOficioModal';
import FiltrosOficios from '../components/FiltrosOficios';
import '../styles/global.css';
import { OficioItem, OficiosFilterParams } from '../types';
import {
  TableHeader,
  OficioTableRow,
  LoadingIndicator,
  EmptyState,
  PaginationSection,
  PageHeader,
  OficioCard,
  SortButton,
} from '../components/ListagemComponents';
import supabase from '../../../utils/supabase';

const ListagemOficios: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [oficios, setOficios] = useState<OficioItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOficioId, setSelectedOficioId] = useState<number | undefined>(undefined);
  const [selectedOficio, setSelectedOficio] = useState<OficioItem | undefined>(undefined);
  const isInitialRender = useRef(true);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [filters, setFilters] = useState<OficiosFilterParams>({
    page: 1,
    pageSize: 10,
    search: '',
    year: currentYear,
    isUsed: undefined,
    sortBy: 'numero',
    sortDirection: 'desc',
  });

  // 🔹 Função principal: buscar ofícios no Supabase
  const fetchOficios = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('oficios').select('*', { count: 'exact' });

      // Filtros
      if (filters.year) query = query.eq('ano', filters.year);
      if (filters.isUsed !== undefined) query = query.eq('utilizado', filters.isUsed);
      if (filters.search && filters.search.trim() !== '') {
        query = query.or(
          `remetente.ilike.%${filters.search}%,destinatario.ilike.%${filters.search}%,cidade.ilike.%${filters.search}%`
        );
      }

      // Ordenação
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortDirection === 'asc' });
      }

      // Paginação
      const from = ((filters.page || 1) - 1) * filters.pageSize!;
      const to = from + filters.pageSize! - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setOficios(data || []);
      setTotalPages(Math.ceil((count || data?.length || 1) / filters.pageSize!));
    } catch (error) {
      console.error('Erro ao buscar ofícios:', error);
      setError('Erro ao carregar os ofícios. Verifique o Supabase ou os filtros.');
      setOficios([]);
    } finally {
      setLoading(false);
    }
  };

  // Inicial
  useEffect(() => {
    fetchOficios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Paginação
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    fetchOficios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page]);

  // Manipuladores de filtro
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setFilters((prev) => ({ ...prev, page: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleYearChange = (e: SelectChangeEvent) => {
    const year = e.target.value ? parseInt(e.target.value) : undefined;
    setFilters((prev) => ({ ...prev, year }));
  };

  const handleUsedChange = (e: SelectChangeEvent) => {
    let isUsed;
    if (e.target.value === 'true') isUsed = true;
    else if (e.target.value === 'false') isUsed = false;
    else isUsed = undefined;
    setFilters((prev) => ({ ...prev, isUsed }));
  };

  const handleFilter = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchOficios();
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      search: '',
      year: undefined,
      isUsed: undefined,
      sortBy: 'numero',
      sortDirection: 'desc',
    });
    fetchOficios();
  };

  const handleEditOficio = (id: number) => {
    const oficio = oficios.find((o) => o.id === id);
    if (oficio) {
      setSelectedOficioId(oficio.id);
      setSelectedOficio(oficio);
      setEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedOficioId(undefined);
    setSelectedOficio(undefined);
  };

  const handleSuccess = () => fetchOficios();
  const handleEditSuccess = () => fetchOficios();

  const toggleFilters = () => setShowFilters(!showFilters);
  const handleTryAgain = () => handleClearFilters();

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortDirection: direction,
      page: 1,
    }));
    fetchOficios();
  };

  // Renderização
  const renderDesktopView = () => (
    <TableContainer
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginTop: 3,
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        <TableHeader />
        <TableBody>
          {oficios.map((oficio) => (
            <OficioTableRow key={oficio.id} oficio={oficio} onEdit={handleEditOficio} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileView = () => (
    <Box sx={{ mt: 3 }}>
      {oficios.map((oficio) => (
        <OficioCard key={oficio.id} oficio={oficio} onEdit={handleEditOficio} />
      ))}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <PageHeader isMobile={isMobile} />

        {/* Botões principais */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            width: '100%',
          }}
        >
          <AdicionarOficioModal onSuccess={handleSuccess} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 1,
              flex: 1,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={toggleFilters}
              size="medium"
              fullWidth
              sx={{
                height: '48px',
                backgroundColor: showFilters ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              }}
            >
              {showFilters ? 'Esconder Opções de Filtro' : 'Mostrar Opções de Filtro'}
            </Button>

            <SortButton
              onSort={handleSort}
              currentSortField={filters.sortBy}
              currentSortDirection={filters.sortDirection}
            />
          </Box>
        </Box>
      </Box>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, fontWeight: 'medium', color: '#1976d2' }}
            >
              Opções de Filtro
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use os campos abaixo para encontrar ofícios específicos
            </Typography>
          </Box>

          <FiltrosOficios
            filters={filters}
            onSearchChange={handleSearchChange}
            onYearChange={handleYearChange}
            onUsedChange={handleUsedChange}
            onFilter={handleFilter}
            onClearFilters={handleClearFilters}
            years={years}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
              mt: 2,
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              fullWidth={isMobile}
              startIcon={<RefreshIcon />}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="contained"
              onClick={handleFilter}
              fullWidth={isMobile}
              startIcon={<SearchIcon />}
            >
              Buscar Ofícios
            </Button>
          </Box>
        </Paper>
      )}

      {loading ? (
        <LoadingIndicator />
      ) : oficios.length === 0 ? (
        <EmptyState onTryAgain={handleTryAgain} />
      ) : (
        <>
          {isMobile ? renderMobileView() : renderDesktopView()}
          <PaginationSection
            page={filters.page || 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <EditarOficioModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
        oficioId={selectedOficioId}
        oficioData={selectedOficio}
      />
    </Container>
  );
};

export default ListagemOficios;
