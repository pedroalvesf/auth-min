import { UniqueEntityID } from './unique-entity-id';

export abstract class Entity<Props> {
  private _id: UniqueEntityID;
  protected props: Props;

  get id() {
    return this._id;
  }

  protected constructor(props: Props, id?: UniqueEntityID) {
    this.props = props;
    this._id = id ?? new UniqueEntityID();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public equals(entity?: Entity<any>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (entity === this) {
      return true;
    }

    if (entity.id.equals(this._id)) {
      return true;
    }

    return false;
  }
}
