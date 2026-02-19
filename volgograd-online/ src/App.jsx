import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function App() {
  // ==================== ГЛОБАЛЬНЫЕ СОСТОЯНИЯ ====================
  const [activeTab, setActiveTab] = useState('Дашборд');
  const [mapCenter, setMapCenter] = useState({ lat: 48.7080, lng: 44.5133 });
  const [zoom, setZoom] = useState(13);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [selectedMarker, setSelectedMarker] = useState(null);

  // ==================== ДАШБОРД ====================
  const [selectedFactory, setSelectedFactory] = useState('ВЛГ');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1 час');
  const [selectedCategory, setSelectedCategory] = useState('Трудозатраты');
  const [isFactoryDropdownOpen, setIsFactoryDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // ==================== СПРАВОЧНИКИ ====================
  const [currentView, setCurrentView] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  // ТМЦ
  const [tmcItems, setTmcItems] = useState([
    { id: 1, code: 'TM001', name: 'Болт М6', quantity: 150, class: 'Деталь', warehouse: 'Склад 1' },
    { id: 2, code: 'TM002', name: 'Гайка М6', quantity: 200, class: 'Деталь', warehouse: 'Склад 1' },
    { id: 3, code: 'TM003', name: 'Шайба', quantity: 300, class: 'Деталь', warehouse: 'Склад 2' },
    { id: 4, code: 'TM004', name: 'Подшипник 6204', quantity: 25, class: 'Сборочная единица', warehouse: 'Склад 1' },
    { id: 5, code: 'TM005', name: 'Масло индустриальное', quantity: 50, class: 'Материал', warehouse: 'Склад 2' },
    { id: 6, code: 'TM006', name: 'Ремкомплект насоса', quantity: 15, class: 'Сборочная единица', warehouse: 'Склад 3' },
    { id: 7, code: 'TM007', name: 'Кабель ВВГ 3х2.5', quantity: 1200, class: 'Материал', warehouse: 'Склад 1' },
    { id: 8, code: 'TM008', name: 'Фильтр масляный', quantity: 80, class: 'Деталь', warehouse: 'Склад 2' },
  ]);
  const [warehouses] = useState(['Все склады', 'Склад 1', 'Склад 2', 'Склад 3']);
  const [selectedWarehouse, setSelectedWarehouse] = useState('Все склады');
  const [tmcSearchQuery, setTmcSearchQuery] = useState('');
  const [isAddTmcModalOpen, setIsAddTmcModalOpen] = useState(false);
  const [isEditTmcModalOpen, setIsEditTmcModalOpen] = useState(false);
  const [currentTmcItem, setCurrentTmcItem] = useState(null);
  const [tmcForm, setTmcForm] = useState({ code: '', name: '', quantity: '', class: 'Деталь', warehouse: 'Склад 1' });
  const [tmcFormErrors, setTmcFormErrors] = useState({});

  // Единицы измерения
  const [unitsItems, setUnitsItems] = useState([
    { id: 1, name: 'Давление', abbreviation: 'Па' },
    { id: 2, name: 'Вес', abbreviation: 'кг' },
    { id: 3, name: 'Количество', abbreviation: 'шт' },
    { id: 4, name: 'Упаковка', abbreviation: 'упак' },
    { id: 5, name: 'Рулон', abbreviation: 'рул' },
    { id: 6, name: 'Длина', abbreviation: 'м' },
    { id: 7, name: 'Площадь', abbreviation: 'м²' },
    { id: 8, name: 'Объем', abbreviation: 'м³' },
    { id: 9, name: 'Температура', abbreviation: '°C' },
    { id: 10, name: 'Мощность', abbreviation: 'кВт' },
  ]);
  const [unitsSearchQuery, setUnitsSearchQuery] = useState('');
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false);
  const [currentUnitItem, setCurrentUnitItem] = useState(null);
  const [unitForm, setUnitForm] = useState({ name: '', abbreviation: '' });
  const [unitFormErrors, setUnitFormErrors] = useState({});

  // Операции
  const [operationsItems, setOperationsItems] = useState([
    { id: 1, factory: 'ВЛГ', name: 'Замена подшипника', description: 'Полная замена подшипника', userGroup: 'Механики' },
    { id: 2, factory: 'ВТР', name: 'Калибровка датчиков', description: 'Проверка датчиков', userGroup: 'АСУТП' },
    { id: 3, factory: 'ВЛГ', name: 'Чистка фильтров', description: 'Очистка фильтров', userGroup: 'Энергетики' },
    { id: 4, factory: 'ВТР', name: 'Ремонт электродвигателя', description: 'Диагностика и ремонт', userGroup: 'Подрядчик' },
  ]);
  const [factoryFilter, setFactoryFilter] = useState('Все заводы');
  const [userGroupFilter, setUserGroupFilter] = useState('Все группы');
  const [operationsSearchQuery, setOperationsSearchQuery] = useState('');
  const [isAddOperationModalOpen, setIsAddOperationModalOpen] = useState(false);
  const [operationForm, setOperationForm] = useState({ factory: 'ВЛГ', name: '', description: '', userGroup: 'Механики' });
  const [operationFormErrors, setOperationFormErrors] = useState({});

  // Рабочие места
  const [workplaces, setWorkplaces] = useState([
    { id: 1, name: 'Цех 1', factory: 'ВЛГ' },
    { id: 2, name: 'Цех 2', factory: 'ВЛГ' },
    { id: 3, name: 'Склад готовой продукции', factory: 'ВТР' },
    { id: 4, name: 'Административное здание', factory: 'ВЛГ' },
  ]);
  const [workplaceFactoryFilter, setWorkplaceFactoryFilter] = useState('Все заводы');
  const [workplaceSearchQuery, setWorkplaceSearchQuery] = useState('');
  const [isAddWorkplaceModalOpen, setIsAddWorkplaceModalOpen] = useState(false);
  const [workplaceForm, setWorkplaceForm] = useState({ name: '', factory: 'ВЛГ' });
  const [workplaceFormErrors, setWorkplaceFormErrors] = useState({});

  // Производители
  const [manufacturers, setManufacturers] = useState([
    { id: 1, name: 'Siemens', country: 'Германия' },
    { id: 2, name: 'ABB', country: 'Швейцария' },
    { id: 3, name: 'Росэлектроника', country: 'Россия' },
    { id: 4, name: 'Schneider Electric', country: 'Франция' },
  ]);
  const [manufacturerSearchQuery, setManufacturerSearchQuery] = useState('');
  const [isAddManufacturerModalOpen, setIsAddManufacturerModalOpen] = useState(false);
  const [manufacturerForm, setManufacturerForm] = useState({ name: '', country: 'Россия' });
  const [manufacturerFormErrors, setManufacturerFormErrors] = useState({});

  // Поставщики
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Asus' },
    { id: 2, name: 'Air' },
    { id: 3, name: 'TechSupply' },
    { id: 4, name: 'IndustrialParts' },
  ]);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '' });
  const [supplierFormErrors, setSupplierFormErrors] = useState({});

  // Оборудование
  const [equipment, setEquipment] = useState([
    { id: 1, name: 'Станок ЧПУ-1', workplace: 'Цех 1', manufacturer: 'Siemens', supplier: 'TechSupply' },
    { id: 2, name: 'Конвейерная лента', workplace: 'Цех 2', manufacturer: 'ABB', supplier: 'IndustrialParts' },
    { id: 3, name: 'Система вентиляции', workplace: 'Административное здание', manufacturer: 'Schneider Electric', supplier: 'Air' },
  ]);
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({ name: '', workplaceId: '', manufacturerId: '', supplierId: '' });
  const [equipmentFormErrors, setEquipmentFormErrors] = useState({});

  // ==================== ЗАВОДЫ ====================
  const [selectedPlant, setSelectedPlant] = useState(null);

  // ==================== СОТРУДНИКИ ====================
  const [staffSubTab, setStaffSubTab] = useState('personnel');
  const [personnel, setPersonnel] = useState([
    { id: 1, fio: 'Иванов Иван Иванович', phone: '+7 (999) 123-45-67', gender: 'М', email: 'ivanov@example.com', position: 'Инженер', access: ['Аналитика', 'Обработка заявок'] },
    { id: 2, fio: 'Петрова Мария Сергеевна', phone: '+7 (999) 234-56-78', gender: 'Ж', email: 'petrova@example.com', position: 'Менеджер', access: ['Полный доступ'] },
  ]);
  const [devices, setDevices] = useState([
    { id: 1, type: 'Компьютер', name: 'ПК-001', affiliation: 'ВЛГ', emae: 'A1:B2:C3:D4:E5:F6' },
    { id: 2, type: 'Планшет', name: 'TAB-002', affiliation: 'ВТР', emae: 'F6:E5:D4:C3:B2:A1' },
  ]);
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [personForm, setPersonForm] = useState({ fio: '', phone: '', gender: 'М', email: '', position: '', access: [] });
  const [deviceForm, setDeviceForm] = useState({ type: 'Компьютер', name: '', affiliation: 'ВЛГ', emae: '' });

  // ==================== ОБСЛУЖИВАНИЕ ====================
  const [maintenanceRequests, setMaintenanceRequests] = useState([
    { 
      id: 1, 
      title: 'Замена подшипника на станке ЧПУ-1', 
      factory: 'ВЛГ', 
      status: 'Новый', 
      equipment: 'Станок ЧПУ-1', 
      description: 'Слышны посторонние шумы при работе станка.', 
      createdAt: new Date().toISOString(),
      tmcUsed: [{ id: 1, name: 'Подшипник 6204', quantity: 2, code: 'TM004' }]
    },
    { 
      id: 2, 
      title: 'Калибровка датчиков давления', 
      factory: 'ВТР', 
      status: 'Открыто', 
      equipment: 'Конвейерная лента', 
      description: 'Датчики показывают некорректные значения.', 
      createdAt: new Date().toISOString(),
      tmcUsed: []
    },
    { 
      id: 3, 
      title: 'Чистка системы вентиляции', 
      factory: 'ВЛГ', 
      status: 'Ожидание', 
      equipment: 'Система вентиляции', 
      description: 'Снижена производительность системы.', 
      createdAt: new Date().toISOString(),
      tmcUsed: []
    },
    { 
      id: 4, 
      title: 'Ремонт электродвигателя насоса', 
      factory: 'ВТР', 
      status: 'Выполнено', 
      equipment: 'Насосная станция', 
      description: 'Электродвигатель не запускается.', 
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      tmcUsed: [{ id: 2, name: 'Ремкомплект насоса', quantity: 1, code: 'TM006' }]
    }
  ]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAddRequestModalOpen, setIsAddRequestModalOpen] = useState(false);
  const [isViewRequestModalOpen, setIsViewRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ title: '', factory: 'ВЛГ', status: 'Новый', equipmentId: '', description: '', estimatedArea: '' });
  const [requestFormErrors, setRequestFormErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState('Все статусы');
  const [maintenanceSearchQuery, setMaintenanceSearchQuery] = useState('');
  const [selectedTmcForRequest, setSelectedTmcForRequest] = useState(null);
  const [tmcQuantityForRequest, setTmcQuantityForRequest] = useState('');

  // ==================== КОНСТАНТЫ ====================
  const tabs = [
    { name: 'Дашборд', icon: '📊' },
    { name: 'Карта', icon: '🗺️' },
    { name: 'Оборудование', icon: '⚙️' },
    { name: 'Обслуживание', icon: '🔧' },
    { name: 'Заводы', icon: '🏭' },
    { name: 'Сотрудники', icon: '👥' },
    { name: 'Отчет', icon: '📈' },
    { name: 'Справочники', icon: '📚' }
  ];

  const factoryOptions = ['ВЛГ', 'ВТР'];
  const timeRangeOptions = ['1 час', '3 часа', '6 часов', '12 часов', '1 день', '3 дня', '7 дней', '1 месяц', '3 месяца'];
  const categoryOptions = ['Трудозатраты', 'Финансы', 'Качество', 'Производительность'];
  const categories = ['Нормативы', 'Классификаторы', 'Единицы измерения', 'Технические характеристики', 'Процедуры обслуживания', 'Безопасность труда'];

  const markers = [
    { id: 1, name: "ВЛГ", type: 'factory', lat: 48.7200, lng: 44.5200, staff: "1,248", revenue: "42.5M ₽" },
    { id: 2, name: "ВТР", type: 'factory', lat: 48.7100, lng: 44.5000, staff: "986", revenue: "38.2M ₽" }
  ];

  const revenueData = [
    { date: 'Пн', income: 420000, expense: 280000, average: 350000 },
    { date: 'Вт', income: 450000, expense: 290000, average: 370000 },
    { date: 'Ср', income: 410000, expense: 310000, average: 360000 },
    { date: 'Чт', income: 480000, expense: 320000, average: 400000 },
    { date: 'Пт', income: 520000, expense: 300000, average: 410000 },
    { date: 'Сб', income: 380000, expense: 250000, average: 315000 },
    { date: 'Вс', income: 350000, expense: 240000, average: 295000 }
  ];

  const utilizationData = [
    { date: 'Пн', utilization: 78 },
    { date: 'Вт', utilization: 82 },
    { date: 'Ср', utilization: 75 },
    { date: 'Чт', utilization: 88 },
    { date: 'Пт', utilization: 92 },
    { date: 'Сб', utilization: 65 },
    { date: 'Вс', utilization: 58 }
  ];

  // ==================== ФИЛЬТРАЦИЯ ====================
  const filteredTmcItems = useMemo(() => tmcItems.filter(item => {
    const matchesWarehouse = selectedWarehouse === 'Все склады' || item.warehouse === selectedWarehouse;
    const matchesSearch = tmcSearchQuery === '' || item.code.toLowerCase().includes(tmcSearchQuery.toLowerCase()) || item.name.toLowerCase().includes(tmcSearchQuery.toLowerCase());
    return matchesWarehouse && matchesSearch;
  }), [tmcItems, selectedWarehouse, tmcSearchQuery]);

  const filteredUnitsItems = useMemo(() => unitsItems.filter(item => {
    const query = unitsSearchQuery.toLowerCase();
    return query === '' || item.name.toLowerCase().includes(query) || item.abbreviation.toLowerCase().includes(query);
  }), [unitsItems, unitsSearchQuery]);

  const filteredOperationsItems = useMemo(() => operationsItems.filter(item => {
    const matchesFactory = factoryFilter === 'Все заводы' || item.factory === factoryFilter;
    const matchesUserGroup = userGroupFilter === 'Все группы' || item.userGroup === userGroupFilter;
    const matchesSearch = operationsSearchQuery === '' || item.name.toLowerCase().includes(operationsSearchQuery.toLowerCase());
    return matchesFactory && matchesUserGroup && matchesSearch;
  }), [operationsItems, factoryFilter, userGroupFilter, operationsSearchQuery]);

  const filteredWorkplaces = useMemo(() => workplaces.filter(item => {
    const matchesFactory = workplaceFactoryFilter === 'Все заводы' || item.factory === workplaceFactoryFilter;
    const matchesSearch = workplaceSearchQuery === '' || item.name.toLowerCase().includes(workplaceSearchQuery.toLowerCase());
    return matchesFactory && matchesSearch;
  }), [workplaces, workplaceFactoryFilter, workplaceSearchQuery]);

  const filteredManufacturers = useMemo(() => manufacturers.filter(item => {
    const query = manufacturerSearchQuery.toLowerCase();
    return query === '' || item.name.toLowerCase().includes(query) || item.country.toLowerCase().includes(query);
  }), [manufacturers, manufacturerSearchQuery]);

  const filteredSuppliers = useMemo(() => suppliers.filter(item => {
    const query = supplierSearchQuery.toLowerCase();
    return query === '' || item.name.toLowerCase().includes(query);
  }), [suppliers, supplierSearchQuery]);

  const filteredRequests = useMemo(() => maintenanceRequests.filter(request => {
    const matchesFactory = factoryFilter === 'Все заводы' || request.factory === factoryFilter;
    const matchesStatus = statusFilter === 'Все статусы' || request.status === statusFilter;
    const query = maintenanceSearchQuery.toLowerCase();
    const matchesSearch = query === '' || request.title.toLowerCase().includes(query) || request.factory.toLowerCase().includes(query) || request.description.toLowerCase().includes(query) || (request.equipment && request.equipment.toLowerCase().includes(query));
    return matchesFactory && matchesStatus && matchesSearch;
  }), [maintenanceRequests, factoryFilter, statusFilter, maintenanceSearchQuery]);

  // ==================== ОБРАБОТЧИКИ ====================
  const handleAddTmc = useCallback(() => {
    const errors = {};
    if (!tmcForm.code.trim()) errors.code = 'Код обязателен';
    if (!tmcForm.name.trim()) errors.name = 'Название обязательно';
    if (!tmcForm.quantity || isNaN(tmcForm.quantity)) errors.quantity = 'Введите корректное количество';
    if (!tmcForm.warehouse) errors.warehouse = 'Выберите склад';
    if (Object.keys(errors).length > 0) { setTmcFormErrors(errors); return; }
    setTmcItems(prev => [{ id: Date.now(), code: tmcForm.code.trim(), name: tmcForm.name.trim(), quantity: parseInt(tmcForm.quantity), class: tmcForm.class, warehouse: tmcForm.warehouse }, ...prev]);
    setIsAddTmcModalOpen(false);
    setTmcForm({ code: '', name: '', quantity: '', class: 'Деталь', warehouse: 'Склад 1' });
    setTmcFormErrors({});
  }, [tmcForm]);

  const handleAddUnit = useCallback(() => {
    const errors = {};
    if (!unitForm.name.trim()) errors.name = 'Наименование обязательно';
    if (!unitForm.abbreviation.trim()) errors.abbreviation = 'Аббревиатура обязательна';
    if (Object.keys(errors).length > 0) { setUnitFormErrors(errors); return; }
    setUnitsItems(prev => [{ id: Date.now(), name: unitForm.name.trim(), abbreviation: unitForm.abbreviation.trim() }, ...prev]);
    setIsAddUnitModalOpen(false);
    setUnitForm({ name: '', abbreviation: '' });
    setUnitFormErrors({});
  }, [unitForm]);

  const handleAddOperation = useCallback(() => {
    const errors = {};
    if (!operationForm.factory) errors.factory = 'Выберите завод';
    if (!operationForm.name.trim()) errors.name = 'Название обязательно';
    if (!operationForm.description.trim()) errors.description = 'Описание обязательно';
    if (!operationForm.userGroup) errors.userGroup = 'Выберите группу';
    if (Object.keys(errors).length > 0) { setOperationFormErrors(errors); return; }
    setOperationsItems(prev => [{ id: Date.now(), ...operationForm }, ...prev]);
    setIsAddOperationModalOpen(false);
    setOperationForm({ factory: 'ВЛГ', name: '', description: '', userGroup: 'Механики' });
    setOperationFormErrors({});
  }, [operationForm]);

  const handleAddWorkplace = useCallback(() => {
    const errors = {};
    if (!workplaceForm.name.trim()) errors.name = 'Название обязательно';
    if (!workplaceForm.factory) errors.factory = 'Выберите завод';
    if (Object.keys(errors).length > 0) { setWorkplaceFormErrors(errors); return; }
    setWorkplaces(prev => [{ id: Date.now(), ...workplaceForm }, ...prev]);
    setIsAddWorkplaceModalOpen(false);
    setWorkplaceForm({ name: '', factory: 'ВЛГ' });
    setWorkplaceFormErrors({});
  }, [workplaceForm]);

  const handleAddManufacturer = useCallback(() => {
    const errors = {};
    if (!manufacturerForm.name.trim()) errors.name = 'Название обязательно';
    if (!manufacturerForm.country) errors.country = 'Выберите страну';
    if (Object.keys(errors).length > 0) { setManufacturerFormErrors(errors); return; }
    setManufacturers(prev => [{ id: Date.now(), ...manufacturerForm }, ...prev]);
    setIsAddManufacturerModalOpen(false);
    setManufacturerForm({ name: '', country: 'Россия' });
    setManufacturerFormErrors({});
  }, [manufacturerForm]);

  const handleAddSupplier = useCallback(() => {
    const errors = {};
    if (!supplierForm.name.trim()) errors.name = 'Название обязательно';
    if (Object.keys(errors).length > 0) { setSupplierFormErrors(errors); return; }
    setSuppliers(prev => [{ id: Date.now(), name: supplierForm.name.trim() }, ...prev]);
    setIsAddSupplierModalOpen(false);
    setSupplierForm({ name: '' });
    setSupplierFormErrors({});
  }, [supplierForm]);

  const handleAddEquipment = useCallback(() => {
    const errors = {};
    if (!equipmentForm.name.trim()) errors.name = 'Название обязательно';
    if (!equipmentForm.workplaceId) errors.workplaceId = 'Выберите рабочее место';
    if (!equipmentForm.manufacturerId) errors.manufacturerId = 'Выберите производителя';
    if (!equipmentForm.supplierId) errors.supplierId = 'Выберите поставщика';
    if (Object.keys(errors).length > 0) { setEquipmentFormErrors(errors); return; }
    const newEquipment = {
      id: Date.now(),
      name: equipmentForm.name.trim(),
      workplace: workplaces.find(w => w.id === parseInt(equipmentForm.workplaceId))?.name || '',
      manufacturer: manufacturers.find(m => m.id === parseInt(equipmentForm.manufacturerId))?.name || '',
      supplier: suppliers.find(s => s.id === parseInt(equipmentForm.supplierId))?.name || '',
    };
    setEquipment(prev => [newEquipment, ...prev]);
    setIsAddEquipmentModalOpen(false);
    setEquipmentForm({ name: '', workplaceId: '', manufacturerId: '', supplierId: '' });
    setEquipmentFormErrors({});
  }, [equipmentForm, workplaces, manufacturers, suppliers]);

  const handleAddRequest = useCallback(() => {
    const errors = {};
    if (!requestForm.title.trim()) errors.title = 'Название обязательно';
    if (!requestForm.factory) errors.factory = 'Выберите завод';
    if (!requestForm.status) errors.status = 'Выберите статус';
    if (!requestForm.equipmentId && !requestForm.estimatedArea.trim()) errors.equipment = 'Укажите оборудование или участок';
    if (Object.keys(errors).length > 0) { setRequestFormErrors(errors); return; }
    const newRequest = {
      id: Date.now(),
      title: requestForm.title.trim(),
      factory: requestForm.factory,
      status: requestForm.status,
      equipment: requestForm.equipmentId ? equipment.find(e => e.id === parseInt(requestForm.equipmentId))?.name || 'Неизвестно' : `Предполагаемый участок: ${requestForm.estimatedArea}`,
      description: requestForm.description.trim(),
      createdAt: new Date().toISOString(),
      tmcUsed: []
    };
    setMaintenanceRequests(prev => [newRequest, ...prev]);
    setIsAddRequestModalOpen(false);
    setRequestForm({ title: '', factory: 'ВЛГ', status: 'Новый', equipmentId: '', description: '', estimatedArea: '' });
    setRequestFormErrors({});
  }, [requestForm, equipment]);

  const handleViewRequest = useCallback((request) => {
    setSelectedRequest(request);
    setIsViewRequestModalOpen(true);
  }, []);

  const handleUpdateRequestStatus = useCallback((status) => {
    if (!selectedRequest) return;
    const updatedRequests = maintenanceRequests.map(req => req.id === selectedRequest.id ? { ...req, status, completedAt: status === 'Выполнено' ? new Date().toISOString() : req.completedAt } : req);
    setMaintenanceRequests(updatedRequests);
    setSelectedRequest(prev => prev ? { ...prev, status, completedAt: status === 'Выполнено' ? new Date().toISOString() : prev.completedAt } : null);
  }, [selectedRequest, maintenanceRequests]);

  const handleAddTmcToRequest = useCallback(() => {
    if (!selectedRequest || !selectedTmcForRequest || !tmcQuantityForRequest || isNaN(tmcQuantityForRequest)) return;
    const tmcItem = tmcItems.find(item => item.id === selectedTmcForRequest);
    if (!tmcItem) return;
    const updatedRequest = { ...selectedRequest, tmcUsed: [...selectedRequest.tmcUsed, { id: Date.now(), name: tmcItem.name, quantity: parseFloat(tmcQuantityForRequest), code: tmcItem.code }] };
    setMaintenanceRequests(prev => prev.map(req => req.id === selectedRequest.id ? updatedRequest : req));
    setSelectedRequest(updatedRequest);
    setSelectedTmcForRequest(null);
    setTmcQuantityForRequest('');
  }, [selectedRequest, selectedTmcForRequest, tmcQuantityForRequest, tmcItems]);

  const handlePlantSelect = useCallback((plantName) => setSelectedPlant(plantName), []);
  const handleBackToPlants = useCallback(() => setSelectedPlant(null), []);

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.map-control') || e.target.closest('.marker-popup')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y });
  }, [mapPosition]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const container = document.querySelector('.map-container');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const maxX = containerRect.width * 0.5;
    const maxY = containerRect.height * 0.5;
    setMapPosition({ x: Math.max(-maxX, Math.min(maxX, e.clientX - dragStart.x)), y: Math.max(-maxY, Math.min(maxY, e.clientY - dragStart.y)) });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    const container = document.querySelector('.map-container');
    if (container) container.style.cursor = 'grab';
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(13);
    setMapPosition({ x: 0, y: 0 });
    setMapCenter({ lat: 48.7080, lng: 44.5133 });
  }, []);

  const calculateMarkerPosition = useCallback((markerLat, markerLng) => {
    const scale = Math.pow(2, zoom - 13);
    const latDiff = (markerLat - mapCenter.lat) * 111000 * scale;
    const lngDiff = (markerLng - mapCenter.lng) * 75000 * scale;
    return { x: mapPosition.x + window.innerWidth / 2 + lngDiff, y: mapPosition.y + window.innerHeight / 2 - latDiff };
  }, [zoom, mapCenter, mapPosition]);

  const renderVolgogradMap = useCallback(() => (
    <svg className="absolute inset-0 opacity-90" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMid slice">
      <rect width="1600" height="1200" fill="#1a2e1a" opacity="0.7"/>
      <path d="M -100 600 Q 300 550 600 600 T 1200 580 T 1700 620" fill="#0f4c81" opacity="0.85" stroke="#0a3a6b" strokeWidth="8"/>
      <text x="800" y="650" fill="#e9edc9" fontSize="36" fontWeight="bold" textAnchor="middle" className="select-none">Волгоград</text>
      <text x="800" y="700" fill="#a7c957" fontSize="16" textAnchor="middle" className="select-none">Волгоградская область</text>
    </svg>
  ), []);

  const generateMetrics = useCallback(() => {
    const configs = {
      'Трудозатраты': [
        { name: 'Emergency Repair Share', favorable: 'low', unit: '%' },
        { name: 'Diagnosis Time', favorable: 'low', unit: 'мин' },
        { name: 'Mean Time to Repair', favorable: 'low', unit: 'ч' },
        { name: 'Resolution Rate', favorable: 'high', unit: '%' },
        { name: 'Average First Response Time', favorable: 'low', unit: 'мин' },
        { name: 'Average Handle Time', favorable: 'low', unit: 'мин' }
      ]
    };
    return configs[selectedCategory].map(metric => {
      const value = Math.floor(Math.random() * 100);
      const isGood = metric.favorable === 'high' ? value > 70 : value < 30;
      return { name: metric.name, value: `${value}${metric.unit}`, isGood, isBad: !isGood };
    });
  }, [selectedCategory]);

  const metrics = generateMetrics();

  // ==================== EFFECTS ====================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.factory-dropdown')) setIsFactoryDropdownOpen(false);
      if (!e.target.closest('.time-dropdown')) setIsTimeDropdownOpen(false);
      if (!e.target.closest('.category-dropdown')) setIsCategoryDropdownOpen(false);
      if (selectedMarker && !e.target.closest('.marker-popup')) setSelectedMarker(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedMarker]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsDragging(false);
        setIsFactoryDropdownOpen(false);
        setIsTimeDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
        setIsAddWorkplaceModalOpen(false);
        setIsAddManufacturerModalOpen(false);
        setIsAddSupplierModalOpen(false);
        setIsAddEquipmentModalOpen(false);
        setIsAddPersonModalOpen(false);
        setIsAddDeviceModalOpen(false);
        setIsAddRequestModalOpen(false);
        setIsViewRequestModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleMouseUp);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', handleMouseUp);
    };
  }, [handleMouseUp]);

  // ==================== RENDER ====================
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <motion.div initial={{ x: -300 }} animate={{ x: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-64 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800/50 fixed h-full flex flex-col z-50 shadow-2xl">
        <div className="p-6 border-b border-gray-800/50">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center">
            <span className="mr-2">🏭</span>Волгоград Онлайн
          </h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center"><span className="mr-1">📍</span>Система управления</p>
        </div>
        <nav className="mt-8 px-4 flex-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.name}
              whileHover={{ x: 8, backgroundColor: 'rgba(56, 189, 248, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(tab.name);
                if (tab.name === 'Заводы') setSelectedPlant(null);
                if (tab.name === 'Справочники') setCurrentView('general');
                if (tab.name === 'Сотрудники') setStaffSubTab('personnel');
              }}
              className={`flex items-center w-full text-left px-4 py-3.5 rounded-xl mb-2 transition-all relative group ${activeTab === tab.name ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 shadow-lg' : 'text-gray-300 hover:bg-gray-800/50'}`}
            >
              <span className="text-xl mr-3 relative z-10">{tab.icon}</span>
              <span className="font-medium relative z-10">{tab.name}</span>
              {activeTab === tab.name && <motion.div layoutId="activeTabIndicator" className="absolute inset-y-2 right-2 w-1.5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            </motion.button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800/50 mt-auto">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mr-3 shadow-lg">
              <span className="text-white font-bold text-lg">А</span>
            </div>
            <div>
              <p className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">Администратор</p>
              <p className="text-xs text-gray-400">admin@system.ru</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="ml-64 flex-1 overflow-auto">
        {/* Дашборд */}
        {activeTab === 'Дашборд' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              {['factory', 'time', 'category'].map((type) => {
                const configs = {
                  factory: { value: selectedFactory, setValue: setSelectedFactory, isOpen: isFactoryDropdownOpen, setIsOpen: setIsFactoryDropdownOpen, options: factoryOptions, icon: '🏭' },
                  time: { value: selectedTimeRange, setValue: setSelectedTimeRange, isOpen: isTimeDropdownOpen, setIsOpen: setIsTimeDropdownOpen, options: timeRangeOptions, icon: '⏱️' },
                  category: { value: selectedCategory, setValue: setSelectedCategory, isOpen: isCategoryDropdownOpen, setIsOpen: setIsCategoryDropdownOpen, options: categoryOptions, icon: '📊' }
                };
                const config = configs[type];
                return (
                  <div key={type} className={`${type}-dropdown relative`}>
                    <button onClick={() => config.setIsOpen(!config.isOpen)} className="flex items-center bg-gradient-to-r from-gray-800/80 to-gray-900/90 border border-gray-700/50 rounded-xl px-5 py-3 w-52 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-xl">
                      <span className="text-xl mr-2">{config.icon}</span>
                      <span className="font-medium">{config.value}</span>
                      <span className="ml-auto text-gray-400 transform transition-transform duration-200">{config.isOpen ? '▲' : '▼'}</span>
                    </button>
                    <AnimatePresence>
                      {config.isOpen && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute mt-2 w-52 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                          {config.options.map((option) => (
                            <button key={option} onClick={() => { config.setValue(option); config.setIsOpen(false); }} className={`block w-full text-left px-5 py-3 hover:bg-gray-800 transition-colors ${config.value === option ? 'bg-cyan-500/10 text-cyan-300 font-medium' : 'text-gray-300'}`}>{option}</button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -5 }} className={`bg-gradient-to-br ${metric.isGood ? 'from-emerald-900/40 via-emerald-800/20 to-black border-emerald-500/40' : metric.isBad ? 'from-rose-900/40 via-rose-800/20 to-black border-rose-500/40' : 'from-cyan-900/30 via-blue-900/20 to-black border-cyan-500/30'} border rounded-2xl p-7 shadow-xl relative overflow-hidden`}>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <p className="text-gray-300 text-sm font-medium mb-1 flex items-center"><span className="mr-2">📈</span>{metric.name}</p>
                        <p className={`text-4xl font-bold ${metric.isGood ? 'text-emerald-300' : metric.isBad ? 'text-rose-300' : 'text-cyan-300'}`}>{metric.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${metric.isGood ? 'bg-emerald-500/20 text-emerald-400' : metric.isBad ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'}`}><span className="text-2xl">{metric.isGood ? '↑' : metric.isBad ? '↓' : '→'}</span></div>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${metric.isGood ? 'bg-emerald-400' : metric.isBad ? 'bg-rose-400' : 'bg-cyan-400'}`}></div>
                      <span className="text-gray-300 text-sm">{metric.isGood ? 'В пределах нормы' : metric.isBad ? 'Требует внимания' : 'Стабильно'}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center"><span className="mr-2">🎯</span>Статус производства</h2>
                  <p className="text-gray-400">Общий анализ эффективности завода <span className="text-cyan-400 font-medium">{selectedFactory}</span> за период: <span className="text-cyan-400 font-medium">{selectedTimeRange}</span></p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <button className="px-5 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:border-cyan-500/30 transition-all flex items-center shadow-md hover:shadow-lg"><span className="mr-2 text-lg">📥</span><span className="font-medium">Экспорт отчета</span></button>
                  <button className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl hover:opacity-90 transition-all flex items-center shadow-lg"><span className="mr-2 text-lg">🖨️</span><span className="font-medium">Печать дашборда</span></button>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                {[{ label: 'Общая эффективность', value: '84%', color: 'cyan', trend: null }, { label: 'Выполнено задач', value: '1,248', color: 'emerald', trend: '↑ 12%' }, { label: 'Простои', value: '14.5ч', color: 'amber', trend: '↓ 8%' }, { label: 'Рентабельность', value: '28.4%', color: 'purple', trend: '↑ 3.2%' }].map((stat, i) => (
                  <div key={i} className="bg-gray-800/30 rounded-2xl p-5 text-center border border-gray-800/50 hover:border-cyan-500/30 transition-all">
                    <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-400 mt-1`}>{stat.value}</p>
                    {stat.trend && <p className={`text-${stat.color}-400 text-sm mt-2`}>{stat.trend}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Карта */}
        {activeTab === 'Карта' && (
          <div className="map-container w-full h-full bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
            <div className="absolute inset-0">{renderVolgogradMap()}</div>
            {markers.map((marker) => {
              const pos = calculateMarkerPosition(marker.lat, marker.lng);
              return (
                <motion.div key={marker.id} className="absolute z-20 cursor-pointer" style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -100%)' }} whileHover={{ scale: 1.3, y: -10, zIndex: 50 }} whileTap={{ scale: 0.95 }} onMouseEnter={() => setSelectedMarker(marker)} onMouseLeave={() => setSelectedMarker(null)}>
                  <div className="relative"><div className="absolute -inset-3 bg-cyan-500 rounded-full opacity-20 blur-xl"></div><div className="relative text-4xl shadow-2xl">🏭</div></div>
                  <AnimatePresence>{selectedMarker?.id === marker.id && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-72 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl shadow-2xl p-5 z-50">
                      <div className="text-center">
                        <div className="text-5xl mb-3">🏭</div>
                        <h3 className="font-bold text-2xl mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{marker.name}</h3>
                        <div className="space-y-2 mt-3">
                          <div className="flex justify-between items-center bg-gray-800/50 rounded-lg p-3"><span className="text-gray-400 flex items-center"><span className="mr-2">👥</span>Штат:</span><span className="font-bold text-cyan-400">{marker.staff}</span></div>
                          <div className="flex justify-between items-center bg-gray-800/50 rounded-lg p-3"><span className="text-gray-400 flex items-center"><span className="mr-2">💰</span>Доход:</span><span className="font-bold text-emerald-400">{marker.revenue}</span></div>
                        </div>
                      </div>
                    </motion.div>
                  )}</AnimatePresence>
                </motion.div>
              );
            })}
            <div className="absolute bottom-8 right-8 flex flex-col space-y-4 z-50">
              <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3 shadow-2xl backdrop-blur-sm">
                <button onClick={() => setZoom(Math.min(zoom + 1, 18))} className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors mb-2 active:scale-95 shadow-lg"><span className="text-2xl font-bold text-cyan-400">+</span></button>
                <div className="w-12 h-1 bg-gray-700 mx-auto my-2 rounded-full"></div>
                <button onClick={() => setZoom(Math.max(zoom - 1, 10))} className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors mb-2 active:scale-95 shadow-lg"><span className="text-2xl font-bold text-cyan-400">−</span></button>
                <div className="w-12 h-1 bg-gray-700 mx-auto my-2 rounded-full"></div>
                <button onClick={handleResetView} className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors active:scale-95 shadow-lg"><span className="text-xl text-cyan-400">⌂</span></button>
              </div>
            </div>
          </div>
        )}

        {/* Заводы */}
        {activeTab === 'Заводы' && (
          <div className="p-8">
            {selectedPlant ? (
              <div>
                <div className="flex items-center mb-8">
                  <motion.button whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }} onClick={handleBackToPlants} className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mr-6 text-lg font-medium"><span className="mr-2 text-2xl">←</span>Назад к списку заводов</motion.button>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">{selectedPlant === 'ВЛГ' ? 'ВОЛМА ВЛГ' : 'Волгоград ВТР'}</h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl p-7 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-cyan-400"><span className="mr-3 text-2xl">🏢</span>Основная информация</h2>
                    <div className="space-y-5">
                      {[{ label: 'Полное название', value: selectedPlant === 'ВЛГ' ? 'ВОЛМА ВЛГ' : 'Волгоград ВТР' }, { label: 'Адрес', value: selectedPlant === 'ВЛГ' ? 'г. Волгоград, ул. Заводская, 15' : 'г. Волгоград, пр. Ленина, 78' }, { label: 'Директор', value: selectedPlant === 'ВЛГ' ? 'Смирнов Алексей Владимирович' : 'Козлов Дмитрий Сергеевич' }, { label: 'Год основания', value: selectedPlant === 'ВЛГ' ? '1954' : '1967' }, { label: 'Количество сотрудников', value: selectedPlant === 'ВЛГ' ? '1,248' : '986' }].map((item, i) => (
                        <div key={i} className="border-b border-gray-800/50 pb-4">
                          <p className="text-gray-400 text-sm mb-1">{item.label}</p>
                          <p className="text-xl font-semibold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl p-7 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-emerald-400"><span className="mr-3 text-2xl">💰</span>Финансовые показатели</h2>
                    <div className="space-y-5">
                      {[{ label: 'Годовой оборот', value: selectedPlant === 'ВЛГ' ? '42.5M ₽' : '38.2M ₽', color: 'emerald' }, { label: 'Рентабельность', value: '28.4%', color: 'cyan' }, { label: 'Инвестиции в модернизацию', value: '5.2M ₽', color: 'amber' }, { label: 'Энергопотребление', value: '1.24 МВт', color: 'purple' }].map((item, i) => (
                        <div key={i} className="border-b border-gray-800/50 pb-4">
                          <p className="text-gray-400 text-sm mb-1">{item.label}</p>
                          <p className={`text-3xl font-bold text-${item.color}-400`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-10">
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">Заводы</h1>
                  <p className="text-gray-400 text-lg flex items-center"><span className="mr-2">🏭</span>Всего: 2 завода</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {['ВЛГ', 'ВТР'].map((plant) => (
                    <motion.div key={plant} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: plant === 'ВЛГ' ? 0 : 0.1 }} whileHover={{ y: -10 }} className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl p-8 shadow-2xl cursor-pointer hover:border-cyan-500/30 transition-all relative overflow-hidden group" onClick={() => handlePlantSelect(plant)}>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-5">
                          <div><span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${plant === 'ВЛГ' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30' : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'}`}>{plant}</span></div>
                          <button className="text-gray-400 hover:text-cyan-400 transition-colors text-xl">✏️</button>
                        </div>
                        <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{plant === 'ВЛГ' ? 'ВОЛМА ВЛГ' : 'Волгоград ВТР'}</h3>
                        <p className="text-gray-300 mb-6 text-lg">{plant === 'ВЛГ' ? 'Крупнейшее предприятие по производству литейных изделий в регионе' : 'Специализируется на производстве трубной продукции для нефтегазовой отрасли'}</p>
                        <div className="grid grid-cols-2 gap-5 mt-6">
                          {[{ label: 'Сотрудников', value: plant === 'ВЛГ' ? '1,248' : '986' }, { label: 'Годовой оборот', value: plant === 'ВЛГ' ? '42.5M ₽' : '38.2M ₽' }, { label: 'Цехов', value: plant === 'ВЛГ' ? '8' : '6' }, { label: 'Оборудование', value: plant === 'ВЛГ' ? '245' : '187' }].map((item, i) => (
                            <div key={i}><p className="text-gray-400 text-sm mb-1">{item.label}</p><p className="text-2xl font-bold">{item.value}</p></div>
                          ))}
                        </div>
                        <div className="mt-8 pt-5 border-t border-gray-800/50 flex justify-between items-center">
                          <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div><span className="text-sm text-gray-300 font-medium">Работает в штатном режиме</span></div>
                          <motion.button whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }} className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold flex items-center text-lg">Подробнее<span className="ml-2 text-xl">→</span></motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Оборудование */}
        {activeTab === 'Оборудование' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">Список оборудования</h1>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddEquipmentModalOpen(true)} className="flex items-center bg-gradient-to-r from-emerald-600 to-cyan-700 hover:opacity-90 transition-all px-7 py-4 rounded-2xl font-bold shadow-2xl text-lg"><span className="text-2xl mr-2">➕</span>Добавить оборудование</motion.button>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/60 backdrop-blur-sm">
                    <tr>
                      <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Название</th>
                      <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Место расположения</th>
                      <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Производитель</th>
                      <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Поставщик</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.map((item, index) => (
                      <motion.tr key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }} className="border-b border-gray-800/30 transition-colors">
                        <td className="py-5 px-7 font-medium text-lg">{item.name}</td>
                        <td className="py-5 px-7"><span className={`px-4 py-1.5 rounded-full text-sm font-medium ${item.workplace.includes('Цех') ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30' : item.workplace.includes('Склад') ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30' : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30'}`}>{item.workplace}</span></td>
                        <td className="py-5 px-7 text-cyan-400 font-medium text-lg">{item.manufacturer}</td>
                        <td className="py-5 px-7">{item.supplier}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {equipment.length === 0 && (
                <div className="text-center py-24 text-gray-400">
                  <div className="text-6xl mb-6">⚙️</div>
                  <h3 className="text-2xl font-bold mb-3">Список оборудования пуст</h3>
                  <p className="max-w-md mx-auto mb-6">Добавьте первое оборудование, чтобы начать работу с системой управления</p>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddEquipmentModalOpen(true)} className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-700 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">Добавить оборудование</motion.button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Обслуживание */}
        {activeTab === 'Обслуживание' && (
          <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">Заявки на обслуживание</h1>
                <p className="text-gray-400 mt-2">Управление заявками на техническое обслуживание и ремонт оборудования</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddRequestModalOpen(true)} className="flex items-center bg-gradient-to-r from-amber-600 to-orange-700 hover:opacity-90 transition-all px-7 py-4 rounded-2xl font-bold shadow-2xl text-lg"><span className="text-2xl mr-2">➕</span>Добавить заявку</motion.button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative w-full sm:w-48">
                <select value={factoryFilter} onChange={(e) => setFactoryFilter(e.target.value)} className="w-full bg-gray-900/80 border border-gray-800/50 rounded-xl py-3.5 px-5 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent text-lg appearance-none">
                  <option value="Все заводы">Все заводы</option>
                  <option value="ВЛГ">ВЛГ</option>
                  <option value="ВТР">ВТР</option>
                </select>
                <div className="absolute right-4 top-3.5 text-gray-400 text-xl">🏭</div>
              </div>
              <div className="relative w-full sm:w-48">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-gray-900/80 border border-gray-800/50 rounded-xl py-3.5 px-5 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent text-lg appearance-none">
                  <option value="Все статусы">Все статусы</option>
                  <option value="Новый">Новый</option>
                  <option value="Открыто">Открыто</option>
                  <option value="Ожидание">Ожидание</option>
                  <option value="Выполнено">Выполнено</option>
                </select>
                <div className="absolute right-4 top-3.5 text-gray-400 text-xl">📊</div>
              </div>
              <div className="relative w-full sm:flex-1">
                <input type="text" placeholder="Поиск по названию, заводу или описанию..." value={maintenanceSearchQuery} onChange={(e) => setMaintenanceSearchQuery(e.target.value)} className="w-full bg-gray-900/80 border border-gray-800/50 rounded-xl py-3.5 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent text-lg" />
                <div className="absolute left-4 top-3.5 text-gray-400 text-xl">🔍</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/60 backdrop-blur-sm">
                    <tr>
                      <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Название заявки</th>
                      <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Завод</th>
                      <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Статус</th>
                      <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Оборудование</th>
                      <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Дата создания</th>
                      <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request, index) => (
                      <motion.tr key={request.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }} className="border-b border-gray-800/30 transition-colors cursor-pointer" onClick={() => handleViewRequest(request)}>
                        <td className="py-5 px-7 font-medium text-lg">{request.title}</td>
                        <td className="py-5 px-7"><span className={`px-4 py-1.5 rounded-full text-sm font-medium ${request.factory === 'ВЛГ' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30' : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'}`}>{request.factory}</span></td>
                        <td className="py-5 px-7"><span className={`px-4 py-1.5 rounded-full text-sm font-medium ${request.status === 'Новый' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30' : request.status === 'Открыто' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30' : request.status === 'Ожидание' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30' : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-500/30'}`}>{request.status}</span></td>
                        <td className="py-5 px-7 text-cyan-400">{request.equipment}</td>
                        <td className="py-5 px-7">{new Date(request.createdAt).toLocaleDateString('ru-RU')}</td>
                        <td className="py-5 px-7"><button onClick={(e) => { e.stopPropagation(); handleViewRequest(request); }} className="text-amber-400 hover:text-amber-300 transition-colors text-xl" title="Просмотреть">👁️</button></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRequests.length === 0 && (
                <div className="text-center py-24 text-gray-400">
                  <div className="text-6xl mb-6">🔧</div>
                  <h3 className="text-2xl font-bold mb-3">{maintenanceSearchQuery || factoryFilter !== 'Все заводы' || statusFilter !== 'Все статусы' ? 'Ничего не найдено' : 'Заявки отсутствуют'}</h3>
                  <p className="max-w-md mx-auto mb-6">{maintenanceSearchQuery || factoryFilter !== 'Все заводы' || statusFilter !== 'Все статусы' ? 'По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.' : 'Создайте первую заявку, чтобы начать работу с системой обслуживания.'}</p>
                  {!maintenanceSearchQuery && factoryFilter === 'Все заводы' && statusFilter === 'Все статусы' && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddRequestModalOpen(true)} className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-700 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">Создать заявку</motion.button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Сотрудники */}
        {activeTab === 'Сотрудники' && (
          <div className="p-8">
            <div className="flex border-b border-gray-800/50 mb-10">
              <button onClick={() => setStaffSubTab('personnel')} className={`px-8 py-4 font-bold text-lg border-b-2 transition-all ${staffSubTab === 'personnel' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}><span className="mr-2">👥</span>Персонал</button>
              <button onClick={() => setStaffSubTab('devices')} className={`px-8 py-4 font-bold text-lg border-b-2 transition-all ${staffSubTab === 'devices' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}><span className="mr-2">📱</span>Устройства</button>
            </div>
            {staffSubTab === 'personnel' ? (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold">Список персонала</h1>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddPersonModalOpen(true)} className="flex items-center bg-gradient-to-r from-cyan-600 to-blue-700 hover:opacity-90 transition-all px-6 py-3 rounded-xl font-bold shadow-lg"><span className="text-xl mr-2">➕</span>Добавить сотрудника</motion.button>
                </div>
                <div className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full">
                    <thead className="bg-gray-800/60 backdrop-blur-sm">
                      <tr>
                        <th className="text-left py-4 px-6 font-bold text-gray-200 border-b border-gray-800/50">ФИО</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-200 border-b border-gray-800/50">Должность</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-200 border-b border-gray-800/50">Телефон</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-200 border-b border-gray-800/50">Email</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-200 border-b border-gray-800/50">Доступ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personnel.map((person, index) => (
                        <motion.tr key={person.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ backgroundColor: 'rgba(56, 189, 248, 0.08)' }} className="border-b border-gray-800/30 transition-colors">
                          <td className="py-4 px-6 font-medium">{person.fio}</td>
                          <td className="py-4 px-6">{person.position}</td>
                          <td className="py-4 px-6 text-cyan-400">{person.phone}</td>
                          <td className="py-4 px-6">{person.email}</td>
                          <td className="py-4 px-6"><div className="flex flex-wrap gap-2">{person.access.map((access, idx) => (<span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium ${access === 'Полный доступ' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30' : access === 'Аналитика' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30' : 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/30'}`}>{access}</span>))}</div></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold">Список устройств</h1>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddDeviceModalOpen(true)} className="flex items-center bg-gradient-to-r from-amber-600 to-orange-700 hover:opacity-90 transition-all px-6 py-3 rounded-xl font-bold shadow-lg"><span className="text-xl mr-2">➕</span>Добавить устройство</motion.button>
                </div>
                <div className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full">
                    <thead className="bg-gray-800/60 backdrop-blur-sm">
                      <tr>
                        <th className="text-left py-4 px-6 font-bold text-gray-200 border-b border-gray-800/50">Тип</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-200 border-b border-gray-800/50">Название</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-200 border-b border-gray-800/50">Принадлежность</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-200 border-b border-gray-800/50">EMAE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices.map((device, index) => (
                        <motion.tr key={device.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }} className="border-b border-gray-800/30 transition-colors">
                          <td className="py-4 px-6"><span className={`px-3 py-1 rounded-full text-sm font-medium ${device.type === 'Компьютер' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30' : device.type === 'Планшет' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30' : device.type === 'Телефон' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30' : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30'}`}>{device.type}</span></td>
                          <td className="py-4 px-6 font-medium">{device.name}</td>
                          <td className="py-4 px-6"><span className={`px-3 py-1 rounded-full text-sm font-medium ${device.affiliation === 'ВЛГ' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30' : device.affiliation === 'ВТР' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30' : device.affiliation === 'ГК' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30' : 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/30'}`}>{device.affiliation}</span></td>
                          <td className="py-4 px-6 font-mono text-cyan-400">{device.emae}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Справочники */}
        {activeTab === 'Справочники' && (
          <div className="p-8">
            {currentView === 'general' && (
              <div>
                <h1 className="text-4xl font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Справочники</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[{ name: 'Рабочие места', view: 'workplaces', icon: '🏭', color: 'from-blue-500 to-cyan-600' }, { name: 'Производители', view: 'manufacturers', icon: '🌍', color: 'from-green-500 to-emerald-600' }, { name: 'Поставщики', view: 'suppliers', icon: '📦', color: 'from-rose-500 to-pink-600' }].map((ref) => (
                    <motion.div key={ref.view} whileHover={{ y: -10 }} whileTap={{ scale: 0.98 }} onClick={() => setCurrentView(ref.view)} className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl p-8 shadow-2xl cursor-pointer hover:border-cyan-500/30 transition-all relative overflow-hidden group">
                      <div className="relative z-10">
                        <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-3xl shadow-lg bg-gradient-to-br ${ref.color}`}>{ref.icon}</div>
                        <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{ref.name}</h3>
                        <p className="text-gray-400 mb-6">{ref.view === 'workplaces' && 'Управление рабочими местами на предприятиях'}{ref.view === 'manufacturers' && 'Каталог производителей оборудования и комплектующих'}{ref.view === 'suppliers' && 'Список поставщиков оборудования и материалов'}</p>
                        <div className="flex items-center text-cyan-400 font-medium"><span>Открыть справочник</span><span className="ml-2 text-xl">→</span></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {currentView === 'workplaces' && (
              <div>
                <div className="flex justify-between items-center mb-10">
                  <button onClick={() => setCurrentView('general')} className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center text-lg font-medium"><span className="mr-2 text-2xl">←</span>Назад к списку справочников</button>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">Справочник Рабочих мест</h1>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddWorkplaceModalOpen(true)} className="flex items-center bg-gradient-to-r from-blue-600 to-cyan-700 hover:opacity-90 transition-all px-6 py-3 rounded-xl font-bold shadow-lg text-lg"><span className="text-xl mr-2">➕</span>Добавить рабочее место</motion.button>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                  <div className="relative w-full sm:w-80"><input type="text" placeholder="Поиск по названию..." value={workplaceSearchQuery} onChange={(e) => setWorkplaceSearchQuery(e.target.value)} className="w-full bg-gray-900/80 border border-gray-800/50 rounded-xl py-4 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-lg" /><div className="absolute left-4 top-3.5 text-gray-400 text-xl">🔍</div></div>
                  <div className="relative w-full sm:w-64"><select value={workplaceFactoryFilter} onChange={(e) => setWorkplaceFactoryFilter(e.target.value)} className="w-full bg-gray-900/80 border border-gray-800/50 rounded-xl py-4 px-6 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-lg appearance-none"><option value="Все заводы">Все заводы</option><option value="ВЛГ">ВЛГ</option><option value="ВТР">ВТР</option></select><div className="absolute right-4 top-3.5 text-gray-400 text-xl">🏭</div></div>
                </div>
                <div className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl">
                  <table className="w-full">
                    <thead className="bg-gray-800/60 backdrop-blur-sm">
                      <tr>
                        <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Название</th>
                        <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Завод</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkplaces.map((item, index) => (
                        <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }} className="border-b border-gray-800/30 transition-colors">
                          <td className="py-5 px-7 font-medium text-lg">{item.name}</td>
                          <td className="py-5 px-7"><span className={`px-4 py-1.5 rounded-full text-sm font-medium ${item.factory === 'ВЛГ' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30' : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'}`}>{item.factory}</span></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {currentView === 'manufacturers' && (
              <div>
                <div className="flex justify-between items-center mb-10">
                  <button onClick={() => setCurrentView('general')} className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center text-lg font-medium"><span className="mr-2 text-2xl">←</span>Назад к списку справочников</button>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">Справочник Производителей</h1>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddManufacturerModalOpen(true)} className="flex items-center bg-gradient-to-r from-green-600 to-emerald-700 hover:opacity-90 transition-all px-6 py-3 rounded-xl font-bold shadow-lg text-lg"><span className="text-xl mr-2">➕</span>Добавить производителя</motion.button>
                </div>
                <div className="mb-8"><div className="relative w-full max-w-2xl"><input type="text" placeholder="Поиск по названию или стране..." value={manufacturerSearchQuery} onChange={(e) => setManufacturerSearchQuery(e.target.value)} className="w-full bg-gray-900/80 border border-gray-800/50 rounded-xl py-4 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent text-lg" /><div className="absolute left-4 top-3.5 text-gray-400 text-xl">🔍</div></div></div>
                <div className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl">
                  <table className="w-full">
                    <thead className="bg-gray-800/60 backdrop-blur-sm">
                      <tr>
                        <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Название</th>
                        <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Страна</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredManufacturers.map((item, index) => (
                        <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.08)' }} className="border-b border-gray-800/30 transition-colors">
                          <td className="py-5 px-7 font-medium text-lg">{item.name}</td>
                          <td className="py-5 px-7"><span className={`px-4 py-1.5 rounded-full text-sm font-medium ${item.country === 'Россия' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30' : item.country === 'Германия' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30' : item.country === 'Франция' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'}`}>{item.country}</span></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {currentView === 'suppliers' && (
              <div>
                <div className="flex justify-between items-center mb-10">
                  <button onClick={() => setCurrentView('general')} className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center text-lg font-medium"><span className="mr-2 text-2xl">←</span>Назад к списку справочников</button>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-pink-500">Справочник Поставщиков</h1>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddSupplierModalOpen(true)} className="flex items-center bg-gradient-to-r from-rose-600 to-pink-700 hover:opacity-90 transition-all px-6 py-3 rounded-xl font-bold shadow-lg text-lg"><span className="text-xl mr-2">➕</span>Добавить поставщика</motion.button>
                </div>
                <div className="mb-8"><div className="relative w-full max-w-2xl"><input type="text" placeholder="Поиск по названию..." value={supplierSearchQuery} onChange={(e) => setSupplierSearchQuery(e.target.value)} className="w-full bg-gray-900/80 border border-gray-800/50 rounded-xl py-4 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-transparent text-lg" /><div className="absolute left-4 top-3.5 text-gray-400 text-xl">🔍</div></div></div>
                <div className="bg-gradient-to-br from-gray-900/80 to-black border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl">
                  <table className="w-full">
                    <thead className="bg-gray-800/60 backdrop-blur-sm">
                      <tr>
                        <th className="text-left py-5 px-7 font-bold text-gray-200 border-b border-gray-800/50 text-lg">Название</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuppliers.map((item, index) => (
                        <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ backgroundColor: 'rgba(244, 63, 94, 0.08)' }} className="border-b border-gray-800/30 transition-colors">
                          <td className="py-5 px-7 font-medium text-lg">{item.name}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Остальные вкладки */}
        {!['Дашборд', 'Карта', 'Заводы', 'Сотрудники', 'Оборудование', 'Обслуживание', 'Справочники'].includes(activeTab) && (
          <div className="p-16 text-center min-h-screen flex flex-col items-center justify-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-8xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{tabs.find(t => t.name === activeTab)?.icon}</motion.div>
            <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">{activeTab}</motion.h2>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-gray-400 max-w-2xl mx-auto text-xl mb-10">{activeTab === 'Обслуживание' && 'Система управления техническим обслуживанием'}{activeTab === 'Отчет' && 'Генерация отчетов по различным параметрам'}</motion.p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-xl transition-all"><span className="mr-3">⚙️</span>Настроить раздел</motion.button>
          </div>
        )}
      </div>

      {/* Модальные окна */}
      <AnimatePresence>
        {/* Все модальные окна для добавления/редактирования элементов */}
        {isAddWorkplaceModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsAddWorkplaceModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800/50 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-7 border-b border-gray-800/50 flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500"><span className="mr-3 text-2xl">🏭</span>Новое рабочее место</h2>
                <button onClick={() => setIsAddWorkplaceModalOpen(false)} className="text-gray-400 hover:text-white transition-colors text-3xl">×</button>
              </div>
              <div className="p-7 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">🏷️</span>Название <span className="text-rose-400 ml-1">*</span></label>
                  <input type="text" value={workplaceForm.name} onChange={(e) => { setWorkplaceForm({...workplaceForm, name: e.target.value}); if (workplaceFormErrors.name) setWorkplaceFormErrors({...workplaceFormErrors, name: ''}); }} className={`w-full bg-gray-800/50 border ${workplaceFormErrors.name ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-lg`} placeholder="Цех 1" />
                  {workplaceFormErrors.name && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{workplaceFormErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">🏭</span>Завод <span className="text-rose-400 ml-1">*</span></label>
                  <select value={workplaceForm.factory} onChange={(e) => { setWorkplaceForm({...workplaceForm, factory: e.target.value}); if (workplaceFormErrors.factory) setWorkplaceFormErrors({...workplaceFormErrors, factory: ''}); }} className={`w-full bg-gray-800/50 border ${workplaceFormErrors.factory ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-lg appearance-none`}>
                    <option value="ВЛГ">ВЛГ</option>
                    <option value="ВТР">ВТР</option>
                  </select>
                  {workplaceFormErrors.factory && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{workplaceFormErrors.factory}</p>}
                </div>
              </div>
              <div className="p-7 border-t border-gray-800/50 flex justify-end space-x-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsAddWorkplaceModalOpen(false); setWorkplaceForm({ name: '', factory: 'ВЛГ' }); setWorkplaceFormErrors({}); }} className="px-6 py-3.5 border border-gray-700/50 rounded-xl hover:bg-gray-800/80 transition-colors text-lg font-medium">Отмена</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddWorkplace} className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-700 rounded-xl hover:opacity-90 transition-all text-lg font-bold shadow-lg">Добавить рабочее место</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Аналогичные модальные окна для производителей, поставщиков, оборудования и заявок */}
        {isAddManufacturerModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsAddManufacturerModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800/50 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-7 border-b border-gray-800/50 flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500"><span className="mr-3 text-2xl">🌍</span>Новый производитель</h2>
                <button onClick={() => setIsAddManufacturerModalOpen(false)} className="text-gray-400 hover:text-white transition-colors text-3xl">×</button>
              </div>
              <div className="p-7 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">🏷️</span>Название <span className="text-rose-400 ml-1">*</span></label>
                  <input type="text" value={manufacturerForm.name} onChange={(e) => { setManufacturerForm({...manufacturerForm, name: e.target.value}); if (manufacturerFormErrors.name) setManufacturerFormErrors({...manufacturerFormErrors, name: ''}); }} className={`w-full bg-gray-800/50 border ${manufacturerFormErrors.name ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent text-lg`} placeholder="Siemens" />
                  {manufacturerFormErrors.name && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{manufacturerFormErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">📍</span>Страна <span className="text-rose-400 ml-1">*</span></label>
                  <select value={manufacturerForm.country} onChange={(e) => { setManufacturerForm({...manufacturerForm, country: e.target.value}); if (manufacturerFormErrors.country) setManufacturerFormErrors({...manufacturerFormErrors, country: ''}); }} className={`w-full bg-gray-800/50 border ${manufacturerFormErrors.country ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent text-lg appearance-none`}>
                    <option value="Россия">Россия</option>
                    <option value="Германия">Германия</option>
                    <option value="Франция">Франция</option>
                  </select>
                  {manufacturerFormErrors.country && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{manufacturerFormErrors.country}</p>}
                </div>
              </div>
              <div className="p-7 border-t border-gray-800/50 flex justify-end space-x-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsAddManufacturerModalOpen(false); setManufacturerForm({ name: '', country: 'Россия' }); setManufacturerFormErrors({}); }} className="px-6 py-3.5 border border-gray-700/50 rounded-xl hover:bg-gray-800/80 transition-colors text-lg font-medium">Отмена</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddManufacturer} className="px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl hover:opacity-90 transition-all text-lg font-bold shadow-lg">Добавить производителя</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isAddSupplierModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsAddSupplierModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800/50 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-7 border-b border-gray-800/50 flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-pink-500"><span className="mr-3 text-2xl">📦</span>Новый поставщик</h2>
                <button onClick={() => setIsAddSupplierModalOpen(false)} className="text-gray-400 hover:text-white transition-colors text-3xl">×</button>
              </div>
              <div className="p-7 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">🏷️</span>Название <span className="text-rose-400 ml-1">*</span></label>
                  <input type="text" value={supplierForm.name} onChange={(e) => { setSupplierForm({ name: e.target.value }); if (supplierFormErrors.name) setSupplierFormErrors({...supplierFormErrors, name: ''}); }} className={`w-full bg-gray-800/50 border ${supplierFormErrors.name ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-transparent text-lg`} placeholder="Asus" />
                  {supplierFormErrors.name && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{supplierFormErrors.name}</p>}
                </div>
              </div>
              <div className="p-7 border-t border-gray-800/50 flex justify-end space-x-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsAddSupplierModalOpen(false); setSupplierForm({ name: '' }); setSupplierFormErrors({}); }} className="px-6 py-3.5 border border-gray-700/50 rounded-xl hover:bg-gray-800/80 transition-colors text-lg font-medium">Отмена</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddSupplier} className="px-6 py-3.5 bg-gradient-to-r from-rose-600 to-pink-700 rounded-xl hover:opacity-90 transition-all text-lg font-bold shadow-lg">Добавить поставщика</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isAddEquipmentModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsAddEquipmentModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800/50 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-7 border-b border-gray-800/50 flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500"><span className="mr-3 text-2xl">⚙️</span>Новое оборудование</h2>
                <button onClick={() => setIsAddEquipmentModalOpen(false)} className="text-gray-400 hover:text-white transition-colors text-3xl">×</button>
              </div>
              <div className="p-7 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">🏷️</span>Название <span className="text-rose-400 ml-1">*</span></label>
                  <input type="text" value={equipmentForm.name} onChange={(e) => { setEquipmentForm({...equipmentForm, name: e.target.value}); if (equipmentFormErrors.name) setEquipmentFormErrors({...equipmentFormErrors, name: ''}); }} className={`w-full bg-gray-800/50 border ${equipmentFormErrors.name ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent text-lg`} placeholder="Станок ЧПУ-1" />
                  {equipmentFormErrors.name && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{equipmentFormErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">🏭</span>Место расположения <span className="text-rose-400 ml-1">*</span></label>
                  <select value={equipmentForm.workplaceId} onChange={(e) => { setEquipmentForm({...equipmentForm, workplaceId: e.target.value}); if (equipmentFormErrors.workplaceId) setEquipmentFormErrors({...equipmentFormErrors, workplaceId: ''}); }} className={`w-full bg-gray-800/50 border ${equipmentFormErrors.workplaceId ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent text-lg appearance-none`}>
                    <option value="">Выберите рабочее место</option>
                    {workplaces.map(workplace => (<option key={workplace.id} value={workplace.id}>{workplace.name} ({workplace.factory})</option>))}
                  </select>
                  {equipmentFormErrors.workplaceId && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{equipmentFormErrors.workplaceId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">🌍</span>Производитель <span className="text-rose-400 ml-1">*</span></label>
                  <select value={equipmentForm.manufacturerId} onChange={(e) => { setEquipmentForm({...equipmentForm, manufacturerId: e.target.value}); if (equipmentFormErrors.manufacturerId) setEquipmentFormErrors({...equipmentFormErrors, manufacturerId: ''}); }} className={`w-full bg-gray-800/50 border ${equipmentFormErrors.manufacturerId ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent text-lg appearance-none`}>
                    <option value="">Выберите производителя</option>
                    {manufacturers.map(manufacturer => (<option key={manufacturer.id} value={manufacturer.id}>{manufacturer.name} ({manufacturer.country})</option>))}
                  </select>
                  {equipmentFormErrors.manufacturerId && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{equipmentFormErrors.manufacturerId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">📦</span>Поставщик <span className="text-rose-400 ml-1">*</span></label>
                  <select value={equipmentForm.supplierId} onChange={(e) => { setEquipmentForm({...equipmentForm, supplierId: e.target.value}); if (equipmentFormErrors.supplierId) setEquipmentFormErrors({...equipmentFormErrors, supplierId: ''}); }} className={`w-full bg-gray-800/50 border ${equipmentFormErrors.supplierId ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent text-lg appearance-none`}>
                    <option value="">Выберите поставщика</option>
                    {suppliers.map(supplier => (<option key={supplier.id} value={supplier.id}>{supplier.name}</option>))}
                  </select>
                  {equipmentFormErrors.supplierId && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{equipmentFormErrors.supplierId}</p>}
                </div>
              </div>
              <div className="p-7 border-t border-gray-800/50 flex justify-end space-x-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsAddEquipmentModalOpen(false); setEquipmentForm({ name: '', workplaceId: '', manufacturerId: '', supplierId: '' }); setEquipmentFormErrors({}); }} className="px-6 py-3.5 border border-gray-700/50 rounded-xl hover:bg-gray-800/80 transition-colors text-lg font-medium">Отмена</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddEquipment} className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-700 rounded-xl hover:opacity-90 transition-all text-lg font-bold shadow-lg">Добавить оборудование</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isAddRequestModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsAddRequestModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800/50 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-7 border-b border-gray-800/50 flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500"><span className="mr-3 text-2xl">🔧</span>Новая заявка на обслуживание</h2>
                <button onClick={() => setIsAddRequestModalOpen(false)} className="text-gray-400 hover:text-white transition-colors text-3xl">×</button>
              </div>
              <div className="p-7 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">📝</span>Название заявки <span className="text-rose-400 ml-1">*</span></label>
                  <input type="text" value={requestForm.title} onChange={(e) => { setRequestForm({...requestForm, title: e.target.value}); if (requestFormErrors.title) setRequestFormErrors({...requestFormErrors, title: ''}); }} className={`w-full bg-gray-800/50 border ${requestFormErrors.title ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent text-lg`} placeholder="Замена подшипника на станке ЧПУ-1" />
                  {requestFormErrors.title && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{requestFormErrors.title}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">🏭</span>Завод <span className="text-rose-400 ml-1">*</span></label>
                    <select value={requestForm.factory} onChange={(e) => { setRequestForm({...requestForm, factory: e.target.value}); if (requestFormErrors.factory) setRequestFormErrors({...requestFormErrors, factory: ''}); }} className={`w-full bg-gray-800/50 border ${requestFormErrors.factory ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent text-lg appearance-none`}>
                      <option value="ВЛГ">ВЛГ</option>
                      <option value="ВТР">ВТР</option>
                    </select>
                    {requestFormErrors.factory && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{requestFormErrors.factory}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">📊</span>Статус <span className="text-rose-400 ml-1">*</span></label>
                    <select value={requestForm.status} onChange={(e) => { setRequestForm({...requestForm, status: e.target.value}); if (requestFormErrors.status) setRequestFormErrors({...requestFormErrors, status: ''}); }} className={`w-full bg-gray-800/50 border ${requestFormErrors.status ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent text-lg appearance-none`}>
                      <option value="Новый">Новый</option>
                      <option value="Открыто">Открыто</option>
                      <option value="Ожидание">Ожидание</option>
                    </select>
                    {requestFormErrors.status && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{requestFormErrors.status}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">⚙️</span>Оборудование</label>
                  <select value={requestForm.equipmentId} onChange={(e) => { setRequestForm({...requestForm, equipmentId: e.target.value, estimatedArea: ''}); if (requestFormErrors.equipment) setRequestFormErrors({...requestFormErrors, equipment: ''}); }} className={`w-full bg-gray-800/50 border ${requestFormErrors.equipment && !requestForm.estimatedArea ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent text-lg appearance-none`}>
                    <option value="">Выберите оборудование</option>
                    {equipment.map(item => (<option key={item.id} value={item.id}>{item.name} ({item.workplace})</option>))}
                  </select>
                  {requestFormErrors.equipment && !requestForm.estimatedArea && <p className="mt-2 text-sm text-rose-400 flex items-center"><span className="mr-1">⚠️</span>{requestFormErrors.equipment}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">📍</span>Предполагаемый участок (если оборудование неизвестно)</label>
                  <input type="text" value={requestForm.estimatedArea} onChange={(e) => { setRequestForm({...requestForm, estimatedArea: e.target.value, equipmentId: ''}); if (requestFormErrors.equipment) setRequestFormErrors({...requestFormErrors, equipment: ''}); }} className={`w-full bg-gray-800/50 border ${requestFormErrors.equipment && !requestForm.equipmentId ? 'border-rose-500' : 'border-gray-700/50'} rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent text-lg`} placeholder="Цех 1, участок механической обработки" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center"><span className="mr-2">📋</span>Описание проблемы</label>
                  <textarea value={requestForm.description} onChange={(e) => setRequestForm({...requestForm, description: e.target.value})} className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent text-lg min-h-[120px]" placeholder="Опишите проблему или необходимые работы..." />
                </div>
              </div>
              <div className="p-7 border-t border-gray-800/50 flex justify-end space-x-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsAddRequestModalOpen(false); setRequestForm({ title: '', factory: 'ВЛГ', status: 'Новый', equipmentId: '', description: '', estimatedArea: '' }); setRequestFormErrors({}); }} className="px-6 py-3.5 border border-gray-700/50 rounded-xl hover:bg-gray-800/80 transition-colors text-lg font-medium">Отмена</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddRequest} className="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-700 rounded-xl hover:opacity-90 transition-all text-lg font-bold shadow-lg">Создать заявку</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isViewRequestModalOpen && selectedRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsViewRequestModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800/50 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-7 border-b border-gray-800/50 flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500"><span className="mr-3 text-2xl">🔧</span>{selectedRequest.title}</h2>
                <button onClick={() => setIsViewRequestModalOpen(false)} className="text-gray-400 hover:text-white transition-colors text-3xl">×</button>
              </div>
              <div className="p-7 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-800/50">
                    <p className="text-gray-400 text-sm mb-1 flex items-center"><span className="mr-2">🏭</span>Завод</p>
                    <p className="text-xl font-semibold"><span className={`px-3 py-1 rounded-full text-sm ${selectedRequest.factory === 'ВЛГ' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>{selectedRequest.factory}</span></p>
                  </div>
                  <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-800/50">
                    <p className="text-gray-400 text-sm mb-1 flex items-center"><span className="mr-2">📊</span>Статус</p>
                    <p className="text-xl font-semibold"><span className={`px-3 py-1 rounded-full text-sm ${selectedRequest.status === 'Новый' ? 'bg-amber-500/20 text-amber-300' : selectedRequest.status === 'Открыто' ? 'bg-emerald-500/20 text-emerald-300' : selectedRequest.status === 'Ожидание' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>{selectedRequest.status}</span></p>
                  </div>
                  <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-800/50 md:col-span-2">
                    <p className="text-gray-400 text-sm mb-1 flex items-center"><span className="mr-2">⚙️</span>Оборудование / Участок</p>
                    <p className="text-xl font-semibold text-cyan-400">{selectedRequest.equipment}</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-800/50">
                    <p className="text-gray-400 text-sm mb-1 flex items-center"><span className="mr-2">📅</span>Дата создания</p>
                    <p className="text-xl font-semibold">{new Date(selectedRequest.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {selectedRequest.completedAt && (
                    <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-800/50">
                      <p className="text-gray-400 text-sm mb-1 flex items-center"><span className="mr-2">✅</span>Дата завершения</p>
                      <p className="text-xl font-semibold text-emerald-400">{new Date(selectedRequest.completedAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  )}
                </div>
                <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-800/50">
                  <p className="text-gray-400 text-sm mb-2 flex items-center"><span className="mr-2">📋</span>Описание проблемы</p>
                  <p className="text-lg whitespace-pre-wrap">{selectedRequest.description || 'Описание отсутствует'}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center"><span className="mr-2">📦</span>Использованные ТМЦ</h3>
                    {!['Выполнено', 'Ожидание'].includes(selectedRequest.status) && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {}} className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-700 rounded-lg font-medium text-sm">Добавить ТМЦ</motion.button>
                    )}
                  </div>
                  {selectedRequest.tmcUsed.length > 0 ? (
                    <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-800/50">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left py-2 px-3 text-gray-300 text-sm">Код</th>
                            <th className="text-left py-2 px-3 text-gray-300 text-sm">Название</th>
                            <th className="text-left py-2 px-3 text-gray-300 text-sm">Количество</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRequest.tmcUsed.map((tmc, idx) => (
                            <tr key={idx} className="border-t border-gray-800/50">
                              <td className="py-2 px-3 font-mono text-cyan-400">{tmc.code}</td>
                              <td className="py-2 px-3">{tmc.name}</td>
                              <td className="py-2 px-3 font-semibold">{tmc.quantity} шт</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-800/50 text-center"><p className="text-gray-400">ТМЦ еще не использованы</p></div>
                  )}
                </div>
                {!['Выполнено'].includes(selectedRequest.status) && (
                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800/50">
                    {selectedRequest.status === 'Новый' && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleUpdateRequestStatus('Открыто')} className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-700 rounded-xl font-bold text-lg shadow-lg">Открыть заявку</motion.button>
                    )}
                    {selectedRequest.status === 'Открыто' && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleUpdateRequestStatus('Ожидание')} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-700 rounded-xl font-bold text-lg shadow-lg">Перевести в ожидание</motion.button>
                    )}
                    {['Открыто', 'Ожидание'].includes(selectedRequest.status) && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleUpdateRequestStatus('Выполнено')} className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-700 rounded-xl font-bold text-lg shadow-lg">Завершить заявку</motion.button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
