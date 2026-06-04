import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { CrmService } from '../../core/services/crm.service';
import { OrderStoreService } from '../../core/services/order-store.service';
import { SiteContentService } from '../../core/services/site-content.service';
import {
  CrmActivity,
  CrmContact,
  CrmConversation,
  CrmOpportunity
} from '../../models/crm.model';
import { OrderNotification } from '../../models/order-notification.model';
import { Order, OrderStatus } from '../../models/order.model';
import {
  PromotionAccent,
  SiteContent
} from '../../models/site-content.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  private readonly destroyRef = inject(DestroyRef);
  orders: Order[] = [];
  notifications: OrderNotification[] = [];
  contacts: CrmContact[] = [];
  conversations: CrmConversation[] = [];
  opportunities: CrmOpportunity[] = [];
  activities: CrmActivity[] = [];
  ownerName = '';
  content: SiteContent = {
    promotions: [],
    videos: [],
    locations: []
  };
  promotionForm = this.createPromotionForm();
  videoForm = this.createVideoForm();
  dashboardMessage = '';
  dashboardMessageTone: 'success' | 'warning' = 'success';
  private messageTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly orderStore: OrderStoreService,
    private readonly crmService: CrmService,
    private readonly siteContent: SiteContentService,
    private readonly authService: AdminAuthService,
    private readonly router: Router
  ) {
    this.ownerName = this.authService.ownerName;

    this.orderStore.orders$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((orders) => {
        this.orders = orders;
      });

    this.orderStore.notifications$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((notifications) => {
        this.notifications = notifications;
      });

    this.crmService.contacts$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((contacts) => {
        this.contacts = contacts;
      });

    this.crmService.conversations$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((conversations) => {
        this.conversations = conversations;
      });

    this.crmService.opportunities$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((opportunities) => {
        this.opportunities = opportunities;
      });

    this.crmService.activities$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((activities) => {
        this.activities = activities;
      });

    this.siteContent.content$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((content) => {
        this.content = content;
      });

    this.orderStore.refreshFromDatabase();
    this.crmService.refreshFromDatabase();
  }

  get incomingOrders(): Order[] {
    return this.orders.filter((order) =>
      ['new', 'confirmed', 'preparing'].includes(order.status)
    );
  }

  get outgoingOrders(): Order[] {
    return this.orders.filter((order) =>
      ['dispatched', 'delivered'].includes(order.status)
    );
  }

  get cancelledOrders(): Order[] {
    return this.orders.filter((order) => order.status === 'cancelled');
  }

  get totalRevenue(): number {
    return this.orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
  }

  get hotLeads(): CrmContact[] {
    return this.contacts.filter((contact) => contact.score >= 35);
  }

  get activeConversations(): CrmConversation[] {
    return this.conversations.filter((conversation) => conversation.status !== 'closed');
  }

  get openPipelineValue(): number {
    return this.opportunities
      .filter((opportunity) => !['won', 'lost'].includes(opportunity.stage))
      .reduce((sum, opportunity) => sum + opportunity.value, 0);
  }

  get unreadNotifications(): number {
    return this.notifications.filter((notification) => !notification.read).length;
  }

  refreshDashboard() {
    this.orderStore.refreshFromDatabase();
    this.crmService.refreshFromDatabase();
    this.showDashboardMessage('Panel actualizado con los ultimos datos disponibles.', 'success');
  }

  advanceOrder(order: Order) {
    const nextStatus = this.getNextStatus(order);

    if (!nextStatus) {
      this.showDashboardMessage('Este pedido ya no tiene una accion siguiente disponible.', 'warning');
      return;
    }

    this.setStatus(order, nextStatus);
  }

  getNextActionLabel(order: Order): string {
    if (order.status === 'new') {
      return 'Confirmar pedido';
    }

    if (order.status === 'confirmed') {
      return 'Enviar a cocina';
    }

    if (order.status === 'preparing') {
      return order.type === 'delivery' ? 'Despachar delivery' : 'Finalizar retiro';
    }

    if (order.status === 'dispatched') {
      return 'Confirmar entrega';
    }

    return 'Flujo cerrado';
  }

  canAdvance(order: Order): boolean {
    return !!this.getNextStatus(order);
  }

  setStatus(order: Order, status: OrderStatus) {
    const updatedOrder = this.orderStore.updateOrderStatus(order.id, status);

    if (!updatedOrder) {
      return;
    }

    this.sendOrderTracking(updatedOrder);
  }

  canDispatch(order: Order): boolean {
    return order.status === 'preparing' && order.type === 'delivery';
  }

  canCompletePickup(order: Order): boolean {
    return order.status === 'preparing' && order.type === 'pickup';
  }

  sendOrderTracking(order: Order) {
    const trackingUrl = this.orderStore.buildCustomerTrackingWhatsAppUrl(order);

    if (!trackingUrl) {
      this.showDashboardMessage(
        `El pedido ${order.sequential} no tiene telefono valido para WhatsApp.`,
        'warning'
      );
      return;
    }

    this.orderStore.openWhatsApp(trackingUrl);
    this.crmService.recordOrderWhatsApp(
      order,
      `Seguimiento enviado al cliente con estado ${this.getStatusLabel(order.status)}.`
    );
    this.showDashboardMessage(
      `Seguimiento de ${order.sequential} enviado por WhatsApp.`,
      'success'
    );
  }

  openContactWhatsApp(contact: CrmContact) {
    const message = [
      `Hola ${contact.name},`,
      'te contactamos de En Boca de Todos para dar seguimiento a tu pedido o consulta.',
      'Estamos atentos para ayudarte.'
    ].join('\n');

    const whatsappUrl = this.crmService.buildContactWhatsAppUrl(contact, message);

    if (!whatsappUrl) {
      this.showDashboardMessage(`El contacto ${contact.name} no tiene telefono.`, 'warning');
      return;
    }

    this.orderStore.openWhatsApp(whatsappUrl);
    this.crmService.recordContactWhatsApp(contact, 'Contacto manual desde panel CRM.');
    this.showDashboardMessage(`Contacto ${contact.name} abierto en WhatsApp.`, 'success');
  }

  getContactName(contactId: string): string {
    return this.contacts.find((contact) => contact.id === contactId)?.name ?? 'Contacto';
  }

  getStatusLabel(status: OrderStatus): string {
    return this.orderStore.getStatusLabel(status);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-EC', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date));
  }

  markAsRead(notificationId: string) {
    this.orderStore.markNotificationAsRead(notificationId);
    this.showDashboardMessage('Notificacion marcada como leida.', 'success');
  }

  savePromotion() {
    if (!this.promotionForm.title.trim() || !this.promotionForm.body.trim()) {
      return;
    }

    this.siteContent.upsertPromotion({
      title: this.promotionForm.title.trim(),
      subtitle: this.promotionForm.subtitle.trim() || 'Publicidad',
      body: this.promotionForm.body.trim(),
      ctaLabel: this.promotionForm.ctaLabel.trim() || 'Ver promocion',
      imageUrl: this.promotionForm.imageUrl.trim() || '/Fondo1.png',
      accent: this.promotionForm.accent,
      active: this.promotionForm.active
    });
    this.promotionForm = this.createPromotionForm();
    this.showDashboardMessage('Publicidad publicada en la landing.', 'success');
  }

  removePromotion(id: string) {
    this.siteContent.removePromotion(id);
    this.showDashboardMessage('Publicidad retirada de la landing.', 'success');
  }

  saveVideo() {
    if (!this.videoForm.title.trim()) {
      return;
    }

    this.siteContent.upsertVideo({
      title: this.videoForm.title.trim(),
      description: this.videoForm.description.trim() || 'Video del negocio',
      videoUrl: this.videoForm.videoUrl.trim(),
      thumbnailUrl: this.videoForm.thumbnailUrl.trim() || '/Fondo1.png',
      active: this.videoForm.active
    });
    this.videoForm = this.createVideoForm();
    this.showDashboardMessage('Video publicado en la landing.', 'success');
  }

  removeVideo(id: string) {
    this.siteContent.removeVideo(id);
    this.showDashboardMessage('Video retirado de la landing.', 'success');
  }

  exportOrdersExcel() {
    const rows = this.orders.map((order) => `
      <tr>
        <td>${this.escapeHtml(order.sequential)}</td>
        <td>${this.escapeHtml(order.customer.name)}</td>
        <td>${this.escapeHtml(order.customer.phone)}</td>
        <td>${this.escapeHtml(order.type)}</td>
        <td>${this.escapeHtml(this.getStatusLabel(order.status))}</td>
        <td>${order.total.toFixed(2)}</td>
        <td>${this.escapeHtml(order.delivery?.address ?? '')}</td>
        <td>${this.escapeHtml(this.formatDate(order.createdAt))}</td>
      </tr>
    `).join('');
    const workbook = `
      <table>
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Cliente</th>
            <th>Telefono</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Direccion</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    this.downloadFile(
      `pedidos-${this.dateStamp()}.xls`,
      workbook,
      'application/vnd.ms-excel;charset=utf-8'
    );
  }

  exportOrdersPdf() {
    const rows = this.orders.map((order) => `
      <tr>
        <td>${this.escapeHtml(order.sequential)}</td>
        <td>${this.escapeHtml(order.customer.name)}</td>
        <td>${this.escapeHtml(order.customer.phone)}</td>
        <td>${this.escapeHtml(order.type)}</td>
        <td>${this.escapeHtml(this.getStatusLabel(order.status))}</td>
        <td>$${order.total.toFixed(2)}</td>
      </tr>
    `).join('');
    const popup = window.open('', '_blank', 'noopener,width=980,height=720');

    if (!popup) {
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>Reporte de pedidos</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #091837; }
            h1 { color: #061a4d; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; }
            th, td { border: 1px solid #d6e2f2; padding: 10px; text-align: left; }
            th { background: #061a4d; color: white; }
          </style>
        </head>
        <body>
          <h1>Reporte de pedidos - En Boca de Todos</h1>
          <p>Generado: ${this.escapeHtml(this.formatDate(new Date().toISOString()))}</p>
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Cliente</th>
                <th>Telefono</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  private createPromotionForm() {
    return {
      title: '',
      subtitle: 'Publicidad destacada',
      body: '',
      ctaLabel: 'Ver promocion',
      imageUrl: '/Fondo1.png',
      accent: 'gold' as PromotionAccent,
      active: true
    };
  }

  private createVideoForm() {
    return {
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '/Fondo1.png',
      active: true
    };
  }

  private downloadFile(fileName: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private dateStamp(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getNextStatus(order: Order): OrderStatus | null {
    if (order.status === 'new') {
      return 'confirmed';
    }

    if (order.status === 'confirmed') {
      return 'preparing';
    }

    if (order.status === 'preparing') {
      return order.type === 'delivery' ? 'dispatched' : 'delivered';
    }

    if (order.status === 'dispatched') {
      return 'delivered';
    }

    return null;
  }

  private showDashboardMessage(message: string, tone: 'success' | 'warning') {
    this.dashboardMessage = message;
    this.dashboardMessageTone = tone;

    if (this.messageTimeoutId) {
      clearTimeout(this.messageTimeoutId);
    }

    this.messageTimeoutId = setTimeout(() => {
      this.dashboardMessage = '';
      this.messageTimeoutId = null;
    }, 4200);
  }
}
