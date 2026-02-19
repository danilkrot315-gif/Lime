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
                      {[{ label: 'Полное название', value: selectedPlant === 'ВЛГ' ? 'ВОЛМА ВЛГ' : 'Волгоград ВТР' }, { label: 'Адрес', value
